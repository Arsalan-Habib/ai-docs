import { Document } from "langchain/document";
import { WebPDFLoader } from "langchain/document_loaders/web/pdf";
import { OpenAIEmbeddings } from "@langchain/openai";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { MemoryVectorStore } from "langchain/vectorstores/memory";

const embeddings = new OpenAIEmbeddings({
  modelName: "text-embedding-3-small",
  openAIApiKey: process.env.OPENAI_API_KEY,
});

const vectorstore = new MemoryVectorStore(embeddings);

export const retriever = vectorstore.asRetriever();

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
