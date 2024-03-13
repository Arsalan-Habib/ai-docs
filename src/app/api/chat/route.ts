import dbConnect from "@/lib/mongodb";
import { vectorstore } from "@/utils";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { ChatOpenAI } from "@langchain/openai";
import { createStuffDocumentsChain } from "langchain/chains/combine_documents";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "../auth/[...nextauth]/route";

const llm = new ChatOpenAI({ modelName: "gpt-3.5-turbo", temperature: 0 });

const PROMPT_TEMPLATE = `
You are an assistant for question-answering tasks. Use the following pieces of retrieved context to answer the question. If you don't know the answer, just say that you don't know. Use three sentences maximum and keep the answer concise. Include relevant references from the context in the answer.
Question: {question} 
Context: {context} 
Answer:
`;

export async function POST(req: NextRequest, res: NextResponse) {
  await dbConnect();
  const session = await getServerSession(authOptions);
  const body = await req.json();

  const retriever = await vectorstore.asRetriever({
    searchType: "mmr",
    searchKwargs: {
      lambda: 0.1,
    },
    filter: {
      postFilterPipeline: [
        {
          $match: {
            groupId: body.groupId,
            userId: session?.user?.id,
          },
        },
      ],
    },
  });

  const result = await retriever.getRelevantDocuments(body.query);

  const prompt = ChatPromptTemplate.fromTemplate(PROMPT_TEMPLATE);

  const ragChain = await createStuffDocumentsChain({
    llm,
    prompt,
    outputParser: new StringOutputParser(),
  });

  const output = await ragChain.invoke({
    question: body.query,
    context: result,
  });

  return NextResponse.json({
    status: true,
    message: "Relevant docs fetched",
    data: {
      output,
      references: result,
    },
  });
}
