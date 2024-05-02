import dbConnect from "@/lib/mongodb";
import { ExtendedMongoDBChatHistory, QuotedAnswer, client, sleep, vectorstore } from "@/utils";
import { authOptions } from "@/utils/authOptions";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts";
import { RunnablePassthrough, RunnableSequence, RunnableWithMessageHistory } from "@langchain/core/runnables";
import { ChatOpenAI, formatToOpenAITool } from "@langchain/openai";
import { Document } from "langchain/document";
import { JsonOutputKeyToolsParser } from "langchain/output_parsers";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 300;

const getMessageHistory = (sessionId: string, docs?: Document[]) =>
  new ExtendedMongoDBChatHistory({
    collection: collection as any,
    sessionId: sessionId,
    sources: docs,
  });

// @ts-ignore
const quotedAnswerTool = formatToOpenAITool(new QuotedAnswer());
const tools2 = [quotedAnswerTool];

const llm = new ChatOpenAI({
  modelName: "gpt-3.5-turbo",
  temperature: 0.2,
  streaming: true,
  cache: true,
});

const namespace = "doc-abstract.historymessages";
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
  console.time("connection");
  await dbConnect();
  const session = await getServerSession(authOptions);
  const body = await req.json();
  console.timeEnd("connection");

  if (!session) {
    return NextResponse.json({
      status: false,
      message: "Please login to continue to chat",
    });
  }

  const retriever = vectorstore.asRetriever({
    searchType: "similarity",
    k: 10,
    filter: {
      preFilter: {
        groupId: {
          $eq: body.groupId,
        },
        userId: {
          $eq: session.user?.id,
        },
      },
    },
  });

  console.time("Relevant Documents Fetch");
  const result = await retriever.getRelevantDocuments(body.query);
  console.timeEnd("Relevant Documents Fetch");

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

  // console.time("Get Message History");
  // const messageHistory = await getMessageHistory(body.groupId).getMessages();
  // console.timeEnd("Get Message History");

  // const messageHistoryString = messageHistory
  //   .map((message) => `${message._getType()}: ${message.content}`)
  //   .join("\n\n");

  // const followUpQuestionCheck = ChatPromptTemplate.fromTemplate(
  //   `You are an expert in checking if the question asked by a user is a follow-up question or not. Given the user question and the chat history, check if the user question is a follow-up question or not. If the user question is a follow-up question, just say "Yes". If the user question is not a follow-up question, just say "No".\n\nQuestion: {question}\n\n Chat history: {history}`,
  // );

  // const followUpQuestionChain = RunnableSequence.from([followUpQuestionCheck, llm, new StringOutputParser()]);

  // console.time("Follow up question chain invoke");
  // const isFollowUpQuestion = await followUpQuestionChain.invoke({
  //   question: body.query,
  //   history: messageHistoryString,
  // });
  // console.timeEnd("Follow up question chain invoke");

  // @ts-ignore
  const ragChainFromDocs = RunnableSequence.from([
    RunnablePassthrough.assign({
      context: (input: any) => convertDocsToString(input.context),
      question: (input: any) => input.question,
    }),
    citationPrompt,
    llmWithTools,
    outputParser,
  ]);

  // @ts-ignore
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

  console.time("Get Citations Invoke");
  // if (isFollowUpQuestion.toLowerCase() === "yes") {
  //   citations = {
  //     citations: [],
  //   };
  // } else {
  citations = await ragChainFromDocs.invoke({
    context: result,
    question: body.query,
  });
  // }
  console.timeEnd("Get Citations Invoke");

  const citationIds = citations.citations.map((c: any) => c.sourceId);

  const docs = result.filter((_, i) => citationIds.includes(i + 1));

  const chainWithHistory = new RunnableWithMessageHistory({
    runnable: ragChainAnswer,

    // @ts-ignore
    getMessageHistory: (sessionId) => getMessageHistory(sessionId, docs),

    inputMessagesKey: "question",
    historyMessagesKey: "history",
  });

  console.time("Answer Stream");
  const output = chainWithHistory.streamEvents(
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
  console.timeEnd("Answer Stream");

  const iterator = makeIterator(output);
  const stream = iteratorToStream(iterator);

  return new NextResponse(stream);
}
