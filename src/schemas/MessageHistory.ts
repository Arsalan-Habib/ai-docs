import mongoose from "mongoose";

interface IMessage {
  type: "human" | "ai";
  data: {
    content: string;
  };
}

export interface IMessageHistory {
  sessionId: string;
  messages: IMessage[];
}

export const messageHistorySchema = new mongoose.Schema<IMessageHistory>({
  sessionId: {
    type: String,
    required: true,
  },
  messages: {
    type: [Object],
  },
});

export default mongoose.models.historymessage ||
  mongoose.model<IMessageHistory>("historymessage", messageHistorySchema);
