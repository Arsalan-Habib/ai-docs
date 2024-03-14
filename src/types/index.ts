export interface ChatMessage {
  type: "human" | "ai";
  data: {
    content: string;
  };
}
