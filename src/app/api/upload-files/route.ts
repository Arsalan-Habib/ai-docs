// import {
//   initializeVectorStoreWithDocuments,
//   loadAndSplitChunks,
//   retriever,
// } from "@/utils";
// import { Document } from "langchain/document";
// import { RunnableSequence } from "langchain/runnables";
// import { NextRequest, NextResponse } from "next/server";

import { NextRequest, NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { MongoDBAtlasVectorSearch } from "@langchain/mongodb";
import { OpenAIEmbeddings } from "@langchain/openai";
// import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import Docs from "@/schemas/Docs";
import dbConnect from "@/lib/mongodb";
import { loadAndSplitChunks } from "@/utils";

const Bucket = process.env.AWS_BUCKET_NAME as string;
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
  },
});

// const convertDocsToString = (docs: Document[]) => {
//   return docs.map((doc) => `<doc>\n${doc.pageContent}\n</doc>`).join("\n\n");
// };

// export async function POST(req: NextRequest) {
//   const formData = await req.formData();

//   const files = formData.getAll("file") as Blob[];

//   console.log("files", files);

//   const docs = await loadAndSplitChunks({
//     fileUrl: files,
//   });

//   await initializeVectorStoreWithDocuments({
//     documents: docs,
//   });

//   const documentRetrievalChain = RunnableSequence.from([
//     (input) => input.question,
//     retriever,
//     convertDocsToString,
//   ]);

//   const response = await documentRetrievalChain.invoke({
//     question: "Why are shaders hard to work with?",
//   });

//   console.log("response", response);

//   // const response = await retriever.invoke("A quote about Give and Take.");

//   // console.log("res", response);

//   return NextResponse.json({ success: true });
// }

export async function POST(req: NextRequest, res: NextResponse) {
  await dbConnect();

  const formData = await req.formData();

  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ success: false, message: "Login to upload" });
  }

  const files = formData.getAll("file") as File[];

  let filenames: string[] = [];

  // const response = await Promise.all(
  //   files.map(async (file) => {
  //     const Body = (await file.arrayBuffer()) as Buffer;
  //     const filename = `${file.name}-${Date.now()}`;
  //     await s3.send(new PutObjectCommand({ Bucket, Key: filename, Body }));
  //     filenames.push(filename);
  //   })
  // );

  // const docs = await loadAndSplitChunks({ fileUrl: files });

  // const model = new OpenAIEmbeddings({
  //   modelName: "text-embedding-3-small",
  // });

  // // const embeddings = await model.embedDocuments(docs);

  // const vectorstore = await MongoDBAtlasVectorSearch.fromDocuments([]);

  await Docs.create({
    userId: session.user?.id,
    uploadedPdfs: filenames,
  });

  return NextResponse.json({
    success: true,
    message: "Uploaded Successfully",
  });
}

// export async function GET(_: Request, { params }: { params: { key : string } }) {
//   const command = new GetObjectCommand({ Bucket, Key: params.key });
//   const src = await getSignedUrl(s3, command, { expiresIn: 3600 });

//   return NextResponse.json({ src });
// }
