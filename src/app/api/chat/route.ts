import dbConnect from "@/lib/mongodb";
import { client, vectorstore } from "@/utils";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts";
import { ChatOpenAI } from "@langchain/openai";
import { createStuffDocumentsChain } from "langchain/chains/combine_documents";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { RunnableWithMessageHistory } from "@langchain/core/runnables";
import { MongoDBChatMessageHistory } from "@langchain/mongodb";
import { authOptions } from "@/utils/authOptions";

const llm = new ChatOpenAI({
  modelName: "gpt-3.5-turbo",
  temperature: 0,
  streaming: true,
});

const namespace = "data-bot.historymessages";
const [dbName, collectionName] = namespace.split(".");

const collection = client.db(dbName).collection(collectionName);

function iteratorToStream(iterator: any) {
  return new ReadableStream({
    async pull(controller) {
      const { value, done } = await iterator.next();

      if (done) {
        controller.close();
      } else {
        controller.enqueue(value);
      }
    },
  });
}

const encoder = new TextEncoder();

const sleep = async (time: number) => {
  return new Promise((resolve) => setTimeout(resolve, time));
};

async function* makeIterator(res: any) {
  for await (const event of res) {
    const eventType = event.event;

    if (eventType === "on_llm_stream") {
      const content = event.data?.chunk?.message?.content;
      // Empty content in the context of OpenAI means
      // that the model is asking for a tool to be invoked via function call.
      // So we only print non-empty content
      if (content !== undefined && content !== "") {
        yield encoder.encode(`${content}`);
        await sleep(20);
      }
    }
  }
}

export async function POST(req: NextRequest, res: NextResponse) {
  await dbConnect();
  const session = await getServerSession(authOptions);
  const body = await req.json();

  if (!session) {
    return NextResponse.json({
      status: false,
      message: "Please login to continue to chat",
    });
  }

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

  const output = await chainWithHistory.streamEvents(
    {
      question: body.query,
      context: result,
    },
    {
      version: "v1",
      configurable: {
        sessionId: body.groupId,
      },
    },
  );

  const iterator = makeIterator(output);
  const stream = iteratorToStream(iterator);

  return new NextResponse(stream);
}
