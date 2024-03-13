import { Document } from "langchain/document";
import { WebPDFLoader } from "langchain/document_loaders/web/pdf";
import { OpenAIEmbeddings } from "@langchain/openai";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { MongoDBAtlasVectorSearch } from "@langchain/mongodb";
import { MongoClient } from "mongodb";

const embeddings = new OpenAIEmbeddings({
  modelName: "text-embedding-3-small",
  openAIApiKey: process.env.OPENAI_API_KEY,
});

// const vectorstore = new MemoryVectorStore(embeddings);

const client = new MongoClient(process.env.MONGODB_URI || "");
const namespace = "data-bot.docs";

const [dbName, collectionName] = namespace.split(".");

const collection = client.db(dbName).collection(collectionName);

export const vectorstore = new MongoDBAtlasVectorSearch(embeddings, {
  collection: collection as any,
  indexName: "data-bot-vector-index",
  textKey: "content",
  embeddingKey: "embedding",
});

export const initializeVectorStoreWithDocuments = async ({
  documents,
}: {
  documents: Document[];
}) => {
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
  const loader = new WebPDFLoader(fileUrl);
  const rawDoc = await loader.load();

  const splitter = new RecursiveCharacterTextSplitter({
    chunkOverlap,
    chunkSize,
  });

  const splitDocs = await splitter.splitDocuments(rawDoc);

  return splitDocs;
};
