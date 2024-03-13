import dbConnect from "@/lib/mongodb";
import DocGroup from "@/schemas/DocGroup";
import { loadAndSplitChunks, vectorstore } from "@/utils";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { randomBytes } from "crypto";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "../auth/[...nextauth]/route";

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

  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ success: false, message: "Login to upload" });
  }

  const files = formData.getAll("file") as File[];

  // const client = new MongoClient(process.env.MONGODB_URI || "");
  // const namespace = "data-bot.docs";

  // const [dbName, collectionName] = namespace.split(".");

  // const collection = client.db(dbName).collection(collectionName);

  // const vectorstore = new MongoDBAtlasVectorSearch(
  //   new OpenAIEmbeddings({
  //     modelName: "text-embedding-3-small",
  //   }),
  //   {
  //     collection: collection as any,
  //     indexName: "data-bot-vector-index",
  //     textKey: "content",
  //     embeddingKey: "embedding",
  //   }
  // );

  const groupId = randomBytes(8).toString("hex");

  let filenames: string[] = [];

  await Promise.all(
    files.map(async (file) => {
      const filename = `${Date.now()}-${file.name}`;
      const Body = (await file.arrayBuffer()) as Buffer;
      await s3.send(new PutObjectCommand({ Bucket, Key: filename, Body }));
      const splitDocs = await loadAndSplitChunks({
        fileUrl: file,
      });

      const docs = splitDocs.map((doc) => ({
        pageContent: doc.pageContent,
        metadata: {
          ...doc.metadata,
          filename,
          userId: session.user?.id,
          groupId: groupId,
        },
      }));

      vectorstore.addDocuments(docs);
      filenames.push(filename);
    })
  );

  if (filenames.length > 0) {
    await DocGroup.create({
      userId: session.user?.id,
      groupId,
      filenames,
    });
  }

  return NextResponse.json({
    success: true,
    message: "Uploaded Successfully",
  });
}
