import { NextRequest, NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { MongoDBAtlasVectorSearch } from "@langchain/mongodb";
import { OpenAIEmbeddings } from "@langchain/openai";
// import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { MongoClient } from "mongodb";
import dbConnect from "@/lib/mongodb";
import { loadAndSplitChunks } from "@/utils";
import { randomBytes } from "crypto";
import DocGroup from "@/schemas/DocGroup";

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

  const client = new MongoClient(process.env.MONGODB_URI || "");
  const namespace = "data-bot.docs";

  const [dbName, collectionName] = namespace.split(".");

  const collection = client.db(dbName).collection(collectionName);

  const vectorstore = new MongoDBAtlasVectorSearch(
    new OpenAIEmbeddings({
      modelName: "text-embedding-3-small",
    }),
    {
      collection: collection as any,
      indexName: "data-bot-vector-index",
      textKey: "content",
      embeddingKey: "embedding",
    }
  );

  const groupId = randomBytes(8).toString("hex");

  let filenames: string[] = [];

  await Promise.all(
    files.map(async (file) => {
      const filename = `${file.name}-${Date.now()}`;
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

  // const result = await vectorstore.maxMarginalRelevanceSearch(
  //   "Scope of chat bot",
  //   {
  //     k: 10,
  //     filter: {
  //       postFilterPipeline: [
  //         {
  //           $match: {
  //             filename:
  //               "Give and Take_ WHY HELPING OTHERS DRIVES OUR SUCCESS ( PDFDrive ).pdf-1710310094622",
  //           },
  //         },
  //       ],
  //     },
  //   }
  // );

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
