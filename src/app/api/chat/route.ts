import dbConnect from "@/lib/mongodb";
import { client, vectorstore } from "@/utils";
import { StringOutputParser } from "@langchain/core/output_parsers";
import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from "@langchain/core/prompts";
import { ChatOpenAI } from "@langchain/openai";
import { createStuffDocumentsChain } from "langchain/chains/combine_documents";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "../auth/[...nextauth]/route";
import { RunnableWithMessageHistory } from "@langchain/core/runnables";
import { MongoDBChatMessageHistory } from "@langchain/mongodb";

const llm = new ChatOpenAI({ modelName: "gpt-3.5-turbo", temperature: 0 });

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

  const prompt = ChatPromptTemplate.fromMessages([
    [
      "system",
      "You are an assistant for question-answering tasks. Use the following pieces of retrieved context to answer the question. Answer the question in as much detail as possible. If you don't know the answer, just say that you don't know.\n\n Context: {context}",
    ],
    new MessagesPlaceholder("history"),
    ["human", "{question}"],
  ]);

  const ragChain = await createStuffDocumentsChain({
    llm,
    prompt,
    outputParser: new StringOutputParser(),
  });

  const namespace = "data-bot.historymessages";
  const [dbName, collectionName] = namespace.split(".");

  const collection = client.db(dbName).collection(collectionName);

  const chainWithHistory = new RunnableWithMessageHistory({
    runnable: ragChain,
    getMessageHistory: (sessionId) =>
      new MongoDBChatMessageHistory({
        collection: collection as any,
        sessionId: sessionId,
      }),
    inputMessagesKey: "question",
    historyMessagesKey: "history",
  });

  const output = await chainWithHistory.invoke(
    {
      question: body.query,
      context: result,
    },
    {
      configurable: {
        sessionId: body.groupId,
      },
    }
  );

  return NextResponse.json({
    status: true,
    message: "Relevant docs fetched",
    data: {
      output,
      references: result,
    },
  });
}
