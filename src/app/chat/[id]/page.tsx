"use client";
import AskQuestionForm from "@/components/AskQuestionForm/AskQuestionForm";
import { ChatMessage } from "@/types";
import { useEffect, useRef, useState } from "react";
import styles from "./chat.module.css";

const Chat = ({ params }: { params: { id: string } }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const messagesContainerRef = useRef<HTMLDivElement | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const response = await fetch(`/api/chat/${params.id}`);

      const data = await response.json();

      setMessages(data.data);
      setLoading(false);
    })();
  }, [params.id]);

  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop =
        messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div style={{ width: "100%", padding: "2rem 2rem" }}>
      <div
        style={{
          maxWidth: "45%",
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
          height: "100%",
        }}
      >
        <div>
          <h1>Chat Name</h1>
        </div>
        <div
          ref={messagesContainerRef}
          style={{
            overflow: "auto",
            flexGrow: 1,
            maxHeight: "95%",
          }}
        >
          {messages.map((message, i) => {
            return (
              <div
                key={i}
                className={
                  message.type === "ai" ? styles.aiMsg : styles.humanMsg
                }
              >
                <p>{message.data.content}</p>
              </div>
            );
          })}
        </div>
        <AskQuestionForm
          setMessages={setMessages}
          messages={messages}
          id={params.id}
        />
      </div>
    </div>
  );
};

export default Chat;
