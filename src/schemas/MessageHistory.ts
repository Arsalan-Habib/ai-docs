import { ChatMessage } from "@/types";
import mongoose from "mongoose";

export interface IMessageHistory {
  sessionId: string;
  messages: ChatMessage[];
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
