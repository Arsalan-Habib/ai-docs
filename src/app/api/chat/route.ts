import dbConnect from "@/lib/mongodb";
import { ExtendedMongoDBChatHistory, QuotedAnswer, client, sleep, vectorstore } from "@/utils";
import { authOptions } from "@/utils/authOptions";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts";
import {
  RunnableMap,
  RunnablePassthrough,
  RunnableSequence,
  RunnableWithMessageHistory,
} from "@langchain/core/runnables";
import { MongoDBChatMessageHistory } from "@langchain/mongodb";
import { ChatOpenAI, formatToOpenAITool } from "@langchain/openai";
import { Document } from "langchain/document";
import { JsonOutputKeyToolsParser } from "langchain/output_parsers";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

const getMessageHistory = (sessionId: string, docs?: Document[]) =>
  new ExtendedMongoDBChatHistory({
    collection: collection as any,
    sessionId: sessionId,
    sources: docs,
  });

const quotedAnswerTool = formatToOpenAITool(new QuotedAnswer());
const tools2 = [quotedAnswerTool];

const llm = new ChatOpenAI({
  modelName: "gpt-3.5-turbo",
  temperature: 0,
  streaming: true,
});

const namespace = "data-bot.historymessages";
const [dbName, collectionName] = namespace.split(".");

const collection = client.db(dbName).collection(collectionName);

const convertDocsToString = (documents: Document[]) => {
  return documents
    .map((doc) => {
      return `
      ===============
      ${doc.pageContent}
      ===============
      `;
    })
    .join("\n");
};

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
    k: 10,
    searchKwargs: {
      fetchK: 20,
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

  const outputParser = new JsonOutputKeyToolsParser({
    keyName: "quoted_answer",
    returnSingle: true,
  });

  const llmWithTools = llm.bind({
    tools: tools2,
    tool_choice: quotedAnswerTool,
  });

  const prompt = ChatPromptTemplate.fromMessages([
    [
      "system",
      `You're a helpful AI assistant. Given a user question and some PDF document chunks, answer the user question. If none of the document chunks answer the question, just say you don't know.\n\nHere are the PDF document chunks:{context}
      `,
    ],
    new MessagesPlaceholder("history"),
    ["human", "{question}"],
  ]);

  const citationPrompt = ChatPromptTemplate.fromMessages([
    [
      "system",
      "You're a helpful AI assistant. Given a user question and some sources, cite the sources related to that question. If none of the sources relates to the question, DO NOT cite anything.\n\nHere are the sources:{context}",
    ],
    ["human", "{question}"],
  ]);

  const messageHistory = await getMessageHistory(body.groupId).getMessages();

  const messageHistoryString = messageHistory
    .map((message) => `${message._getType()}: ${message.content}`)
    .join("\n\n");

  const followUpQuestionCheck = ChatPromptTemplate.fromTemplate(
    `You are an expert in checking if the question asked by a user is a follow-up question or not. Given the user question and the chat history, check if the user question is a follow-up question or not. If the user question is a follow-up question, just say "Yes". If the user question is not a follow-up question, just say "No".\n\nQuestion: {question}\n\n Chat history: {history}`,
  );

  const followUpQuestionChain = RunnableSequence.from([followUpQuestionCheck, llm, new StringOutputParser()]);

  const isFollowUpQuestion = await followUpQuestionChain.invoke({
    question: body.query,
    history: messageHistoryString,
  });

  const ragChainFromDocs = RunnableSequence.from([
    RunnablePassthrough.assign({
      context: (input: any) => convertDocsToString(input.context),
      question: (input: any) => input.question,
    }),
    citationPrompt,
    llmWithTools,
    outputParser,
  ]);

  const ragChainAnswer = RunnableSequence.from([
    {
      context: (input: any) => convertDocsToString(input.context),
      question: (input: any) => input.question,
      history: (input: any) => input.history,
    },
    prompt,
    llm,
    new StringOutputParser(),
  ]);

  let citations: any;

  if (isFollowUpQuestion.toLowerCase() === "yes") {
    citations = {
      citations: [],
    };
  } else {
    citations = await ragChainFromDocs.invoke({
      context: result,
      question: body.query,
    });
  }

  const citationIds = citations.citations.map((c: any) => c.sourceId);

  const docs = result.filter((_, i) => citationIds.includes(i + 1));

  const chainWithHistory = new RunnableWithMessageHistory({
    runnable: ragChainAnswer,

    getMessageHistory: (sessionId) => getMessageHistory(sessionId, docs),

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
