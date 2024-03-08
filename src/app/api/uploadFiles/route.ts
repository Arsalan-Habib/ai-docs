import {
  initializeVectorStoreWithDocuments,
  loadAndSplitChunks,
  retriever,
} from "@/utils";
import { Document } from "langchain/document";
import { RunnableSequence } from "langchain/runnables";
import { NextRequest, NextResponse } from "next/server";

const convertDocsToString = (docs: Document[]) => {
  return docs.map((doc) => `<doc>\n${doc.pageContent}\n</doc>`).join("\n\n");
};

export async function POST(req: NextRequest) {
  const formData = await req.formData();

  const files = formData.getAll("file") as Blob[];

  console.log("files", files);

  const docs = await loadAndSplitChunks({
    fileUrl: files,
  });

  await initializeVectorStoreWithDocuments({
    documents: docs,
  });

  const documentRetrievalChain = RunnableSequence.from([
    (input) => input.question,
    retriever,
    convertDocsToString,
  ]);

  const response = await documentRetrievalChain.invoke({
    question: "Why are shaders hard to work with?",
  });

  console.log("response", response);

  // const response = await retriever.invoke("A quote about Give and Take.");

  // console.log("res", response);

  return NextResponse.json({ success: true });
}
