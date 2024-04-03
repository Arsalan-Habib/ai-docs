import { Document } from "langchain/document";
import { WebPDFLoader } from "langchain/document_loaders/web/pdf";
import { OpenAIEmbeddings } from "@langchain/openai";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { MongoDBAtlasVectorSearch, MongoDBChatMessageHistory } from "@langchain/mongodb";
import { MongoClient } from "mongodb";
import { Blob } from "buffer";
import { BaseMessage } from "langchain/schema";
import { StructuredTool } from "@langchain/core/tools";
import { z } from "zod";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { Bucket, s3 } from "./constants";

const embeddings = new OpenAIEmbeddings({
  modelName: "text-embedding-3-small",
  openAIApiKey: process.env.OPENAI_API_KEY,
});

export const client = new MongoClient(process.env.MONGODB_URI || "");
const namespace = "data-bot.docs";

const [dbName, collectionName] = namespace.split(".");

const collection = client.db(dbName).collection(collectionName);

export const vectorstore = new MongoDBAtlasVectorSearch(embeddings, {
  collection: collection as any,
  indexName: "data-bot-vector-index",
  textKey: "content",
  embeddingKey: "embedding",
});

export const initializeVectorStoreWithDocuments = async ({ documents }: { documents: Document[] }) => {
  await vectorstore.addDocuments(documents);

  return vectorstore;
};

export const loadAndSplitChunks = async ({
  chunkSize = 1536,
  chunkOverlap = 200,
  fileUrl,
}: {
  chunkSize?: number;
  chunkOverlap?: number;
  fileUrl: Blob;
}) => {
  const loader = new WebPDFLoader(fileUrl as any);
  const rawDoc = await loader.load();

  const splitter = new RecursiveCharacterTextSplitter({
    chunkOverlap,
    chunkSize,
    keepSeparator: true,
  });

  const splitDocs = await splitter.splitDocuments(rawDoc);

  return splitDocs;
};

export const sleep = async (time: number) => {
  return new Promise((resolve) => setTimeout(resolve, time));
};

export class ExtendedMongoDBChatHistory extends MongoDBChatMessageHistory {
  sources: any;

  constructor({ sources, collection, sessionId }: any) {
    super({ collection, sessionId });

    this.sources = sources;
  }
  async addMessage(message: BaseMessage) {
    if (message._getType() === "ai") {
      message.additional_kwargs = {
        sources: this.sources,
      };
    }

    await super.addMessage(message);
  }
}

const citationSchema = z.object({
  id: z.string().describe("Unique ID for the source. for example: [T1], [T2], [T3] etc."),
  sourceId: z
    .number()
    .min(1)
    .describe("The integer ID that starts with 1 of a SPECIFIC source which justifies the answer."),
  quote: z.string().describe("The VERBATIM quote from the specified source that justifies the answer."),
});

export class QuotedAnswer extends StructuredTool {
  name = "quoted_answer";

  description = "Answer the user question based only on the given sources, and cite the sources used.";

  schema = z.object({
    answer: z.string().describe("The answer to the user question, which is based only on the given sources."),
    citations: z.array(citationSchema).optional().describe("Citations from the given sources that justify the answer."),
  });

  constructor() {
    super();
  }

  _call(input: z.infer<(typeof this)["schema"]>): Promise<string> {
    return Promise.resolve(JSON.stringify(input, null, 2));
  }
}

export async function deleteFileFromAWS(fileKey: string) {
  const command = new DeleteObjectCommand({
    Bucket: Bucket,
    Key: fileKey,
  });
  const response = await s3.send(command);

  console.log("AWS response", response);

  return response;
}
