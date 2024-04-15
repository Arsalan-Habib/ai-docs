"use client";

import { ChatMessage } from "@/types";
import React, { useEffect, useRef, useState } from "react";
import AskQuestionForm from "../AskQuestionForm/AskQuestionForm";
import styles from "./MessagesSection.module.css";
import { IconButton, Typography } from "@mui/material";
import DeleteIcon from "@/icons/DeleteIcon";

const MessagesSection = ({
  params,
  setSearchQuery,
  groupTitle,
}: {
  params: { id: string };
  groupTitle: string;
  setSearchQuery: React.Dispatch<
    React.SetStateAction<{ content: string; pageNumber: number; transforms?: number[][] } | undefined>
  >;
}) => {
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
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);

  async function deleteHistory() {
    const response = await fetch(`/api/chat/${params.id}`, {
      method: "DELETE",
    });

    const data = await response.json();

    console.log("res", data);
    setMessages(data.data);
  }

  return (
    <div
      style={{
        width: "100%",
        maxWidth: "50%",
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
        height: "100%",
      }}
    >
      <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
        <h1>{groupTitle}</h1>
        <IconButton style={{ background: `var(--secondary-color)` }} onClick={() => deleteHistory()}>
          <DeleteIcon />
        </IconButton>
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
              className={message.type === "ai" || message.type === "loading" ? styles.aiMsg : styles.humanMsg}
            >
              <p>{message.data.content}</p>
              {message.data.additional_kwargs &&
                message.data.additional_kwargs.sources &&
                message.data.additional_kwargs.sources.length > 0 && (
                  <div style={{ marginTop: "0.5rem" }}>
                    <h5>Sources:</h5>
                    <div style={{ display: "flex", gap: "0.2rem", marginTop: "0.2rem", flexWrap: "wrap" }}>
                      {message.data.additional_kwargs.sources.map((source: any, i: number) => (
                        <p
                          onClick={() =>
                            setSearchQuery({
                              content: source.pageContent,
                              pageNumber: source.metadata.loc.pageNumber,
                              transforms: source.metadata.loc.transforms,
                            })
                          }
                          key={i}
                          style={{
                            cursor: "pointer",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            width: "25px",
                            height: "25px",
                            fontSize: "1.1rem",
                            borderRadius: "50%",
                            background: "#9ec8ff",
                          }}
                        >
                          <pre>
                            <code>P#{source.metadata.loc.pageNumber}</code>
                          </pre>
                        </p>
                      ))}
                    </div>
                  </div>
                )}
            </div>
          );
        })}
      </div>
      <AskQuestionForm setMessages={setMessages} messages={messages} id={params.id} />
    </div>
  );
};

export default MessagesSection;
