import dbConnect from "@/lib/mongodb";
import DocGroup from "@/schemas/DocGroup";
import { loadAndSplitChunks, vectorstore } from "@/utils";
import { authOptions } from "@/utils/authOptions";
import { GetBucketCorsCommand, GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { Blob } from "buffer";
import { randomBytes } from "crypto";
import { Document } from "langchain/document";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 300;

const Bucket = process.env.AWS_BUCKET_NAME as string;
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
  },
});

export async function POST(req: NextRequest) {
  await dbConnect();

  const formData = await req.formData();

  const folderId = formData.get("folderId");
  const groupName = formData.get("groupName");
  const filenames = formData.getAll("filename");
  const mergedFilename = formData.get("mergedFilename");

  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ success: false, message: "Login to upload" });
  }

  if (filenames.length === 0) {
    return NextResponse.json({ success: false, message: "No files found" });
  }

  const groupId = randomBytes(8).toString("hex");

  const command = new GetObjectCommand({ Bucket, Key: mergedFilename as string });
  const src = await getSignedUrl(s3, command, { expiresIn: 3600 });

  const response = await fetch(src);
  const mergedPdfBuffer = await response.arrayBuffer();

  const splitDocs: Document[] = await loadAndSplitChunks({
    fileUrl: mergedPdfBuffer,
  });

  // return NextResponse.json({
  //   message: "Checking",
  // });

  // pdfjs.getDocument(mergedPdfBuffer).promise.then((data) => {
  //   for (let i = 0; i < data.numPages; i++) {
  //     data.getPage(i + 1).then((page) => {
  //       page.getTextContent().then((text) => {
  //         console.log(`page ${i + 1}`, text);
  //       });
  //     });
  //   }
  // });

  const docs = splitDocs.map((doc) => ({
    pageContent: doc.pageContent,
    metadata: {
      ...doc.metadata,
      filename: mergedFilename,
      userId: session.user?.id,
      groupId: groupId,
    },
  }));

  await vectorstore.addDocuments(docs);
  const firstFilename = (filenames[0] as string).split("-", 2);

  if (filenames.length > 0) {
    await DocGroup.create({
      userId: session.user?.id,
      groupName: groupName || firstFilename[1],
      folderId: folderId || undefined,
      groupId,
      filenames,
      mergedFilename: mergedFilename,
    });
  }

  revalidatePath("/library");

  return NextResponse.json({
    success: true,
    message: "Uploaded Successfully",
    data: {
      groupId: groupId,
    },
  });
}
