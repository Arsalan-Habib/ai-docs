import { Document } from "langchain/document";
import { WebPDFLoader } from "langchain/document_loaders/web/pdf";
import { OpenAIEmbeddings } from "@langchain/openai";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { MongoDBAtlasVectorSearch } from "@langchain/mongodb";
import { MongoClient } from "mongodb";
import { Blob } from "buffer";

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
