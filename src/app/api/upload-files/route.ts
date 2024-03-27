import dbConnect from "@/lib/mongodb";
import DocGroup from "@/schemas/DocGroup";
import { loadAndSplitChunks, vectorstore } from "@/utils";
import { authOptions } from "@/utils/authOptions";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { Blob } from "buffer";
import { randomBytes } from "crypto";
import { Document } from "langchain/document";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import PDFMerger from "pdf-merger-js";

const Bucket = process.env.AWS_BUCKET_NAME as string;
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
  },
});

export async function POST(req: NextRequest, res: NextResponse) {
  await dbConnect();

  const formData = await req.formData();

  const folderId = formData.get("folderId");
  const groupName = formData.get("groupName");

  console.log({ folderId, groupName });

  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ success: false, message: "Login to upload" });
  }

  const files = formData.getAll("file") as File[];

  if (files.length === 0) {
    return NextResponse.json({ success: false, message: "No files found" });
  }

  const groupId = randomBytes(8).toString("hex");
  const randomFilename = `${Date.now()}-${randomBytes(6).toString("hex")}.pdf`;
  const merger = new PDFMerger();

  let filenames: string[] = [];

  await Promise.all(
    files.map(async (file) => {
      const filename = `${Date.now()}-${file.name}`;
      const Body = (await file.arrayBuffer()) as Buffer;
      await s3.send(new PutObjectCommand({ Bucket, Key: filename, Body }));
      await merger.add(file);

      filenames.push(filename);
    }),
  );

  const mergedPdfBuffer = await merger.saveAsBuffer();
  // const file = new File([mergedPdfBuffer], `${randomFilename}.pdf`, { type: "application/pdf" });
  const file = new Blob([mergedPdfBuffer], { type: "application/pdf" });

  const splitDocs: Document[] = await loadAndSplitChunks({
    fileUrl: file,
  });

  const docs = splitDocs.map((doc) => ({
    pageContent: doc.pageContent,
    metadata: {
      ...doc.metadata,
      filename: randomFilename,
      userId: session.user?.id,
      groupId: groupId,
    },
  }));

  await vectorstore.addDocuments(docs);

  await s3.send(
    new PutObjectCommand({
      Bucket: Bucket,
      Key: randomFilename,
      Body: mergedPdfBuffer,
    }),
  );

  if (filenames.length > 0) {
    await DocGroup.create({
      userId: session.user?.id,
      groupName: groupName || "Untitled",
      folderId: folderId || undefined,
      groupId,
      filenames,
      mergedFilename: randomFilename,
    });
  }

  // revalidatePath("/chat", "layout");

  return NextResponse.json({
    success: true,
    message: "Uploaded Successfully",
    data: {
      groupId: 12312,
    },
  });
}
