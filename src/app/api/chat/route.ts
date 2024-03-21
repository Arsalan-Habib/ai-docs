import dbConnect from "@/lib/mongodb";
import { client, sleep, vectorstore } from "@/utils";
import { authOptions } from "@/utils/authOptions";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts";
import { RunnableWithMessageHistory } from "@langchain/core/runnables";
import { MongoDBChatMessageHistory } from "@langchain/mongodb";
import { ChatOpenAI } from "@langchain/openai";
import { createStuffDocumentsChain } from "langchain/chains/combine_documents";
import { getServerSession } from "next-auth";
import { RunnableMap, RunnablePassthrough, RunnableSequence } from "@langchain/core/runnables";
import { NextRequest, NextResponse } from "next/server";
import { Document } from "langchain/document";
import { JsonOutputKeyToolsParser } from "langchain/output_parsers";
import { formatDocumentsAsString } from "langchain/util/document";
import { type BaseMessage } from "langchain/schema";

import { z } from "zod";
import { StructuredTool } from "@langchain/core/tools";
import { formatToOpenAITool } from "@langchain/openai";

class ExtendedMongoDBChatHistory extends MongoDBChatMessageHistory {
  citations: any;

  constructor({ citations, collection, sessionId }: any) {
    super({ collection, sessionId });

    this.citations = citations;
  }
  async addMessage(message: BaseMessage) {
    if (message._getType() === "ai") {
      message.additional_kwargs = {
        citations: this.citations,
      };
    }

    await super.addMessage(message);
  }
}

const citationSchema = z.object({
  id: z.string().describe("Unique ID for the source. for example: [T1], [T2], [T3] etc."),
  sourceId: z.number().describe("The integer ID of a SPECIFIC source which justifies the answer."),
  quote: z.string().describe("The VERBATIM quote from the specified source that justifies the answer."),
});

class QuotedAnswer extends StructuredTool {
  name = "quoted_answer";

  description = "Answer the user question based only on the given sources, and cite the sources used.";

  schema = z.object({
    answer: z.string().describe("The answer to the user question, which is based only on the given sources."),
    citations: z.array(citationSchema).describe("Citations from the given sources that justify the answer."),
  });

  constructor() {
    super();
  }

  _call(input: z.infer<(typeof this)["schema"]>): Promise<string> {
    return Promise.resolve(JSON.stringify(input, null, 2));
  }
}

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
      lambda: 0.2,
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

  // const REPHRASE_QUESTION_SYSTEM_TEMPLATE = `
  //   Given the following conversation and a follow up question,
  //   rephrase the follow up question to be a standalone question.
  // `;

  // const rephraseQuestionChainPrompt = ChatPromptTemplate.fromMessages([
  //   ["system", REPHRASE_QUESTION_SYSTEM_TEMPLATE],
  //   new MessagesPlaceholder("history"),
  //   ["human", "Rephrase the following question to be a standalone question:\n{question}"],
  // ]);

  // const rephraseQuestionChain = RunnableSequence.from([rephraseQuestionChainPrompt, llm, new StringOutputParser()]);

  const ragChainFromDocs = RunnableSequence.from([
    RunnablePassthrough.assign({
      context: (input: any) => convertDocsToString(input.context),
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

  const ragChainWithSource = new RunnableMap({
    steps: {
      context: (input: any) => input.context,
      question: (input: any) => input.question,
      quoted_answer: ragChainFromDocs,
    },
  });

  const citations = await ragChainWithSource.invoke({
    context: result,
    question: body.query,
  });

  const chainWithHistory = new RunnableWithMessageHistory({
    runnable: ragChainAnswer,

    getMessageHistory: (sessionId) =>
      new ExtendedMongoDBChatHistory({
        collection: collection as any,
        sessionId: sessionId,
        citations: citations.quoted_answer.citations,
      }),

    inputMessagesKey: "question",
    historyMessagesKey: "history",

    // outputMessagesKey: "quoted_answer.answer",
  });

  // const output = await chainWithHistory.streamEvents(
  //   {
  //     question: body.query,
  //     context: result,
  //   },
  //   {
  //     version: "v1",
  //     configurable: {
  //       sessionId: body.groupId,
  //     },
  //   },
  // );

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
  console.log("output", output);

  return new NextResponse(stream);
}
