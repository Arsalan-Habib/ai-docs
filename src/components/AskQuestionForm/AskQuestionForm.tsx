"use client";

import { ChatMessage } from "@/types";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import React, { useEffect, useState } from "react";
import styles from "./AskQuestionForm.module.css";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

async function* streamingFetch(response: Response) {
  // Attach Reader
  const reader = response.body?.getReader();
  while (true) {
    if (reader) {
      // wait for next encoded chunk
      const { done, value } = await reader.read();
      // check if stream is done
      if (done) break;
      // Decodes data chunk and yields it
      yield new TextDecoder().decode(value);
    }
  }
}

const AskQuestionForm = ({
  setMessages,
  messages,
  id,
}: {
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  messages: ChatMessage[];
  id: string;
}) => {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const { status } = useSession();
  const navigate = useRouter();

  const sendQuery = async () => {
    const res = await fetch("/api/chat", {
      method: "POST",

      body: JSON.stringify({
        query: message,
        groupId: id,
      }),
    });

    for await (const chunk of streamingFetch(res)) {
      setMessages((prev) => {
        if (prev[messages.length + 1].type === "loading") {
          prev.pop();
          prev.push({ type: "ai", data: { content: chunk } });
        } else {
          prev[messages.length + 1].data.content += chunk;
        }

        return [...prev];
      });
    }

    const response = await fetch(`/api/chat/${id}`);

    const data = await response.json();

    setMessages(data.data);
  };

  useEffect(() => {
    if (status === "unauthenticated") {
      navigate.push("/signin");
    }
  }, [status, navigate]);

  return (
    <Box
      sx={{ width: "100%", display: "flex", flexDirection: "column" }}
      component="form"
      onSubmit={(e) => {
        e.preventDefault();

        sendQuery();

        setMessages((prev) => [
          ...prev,
          {
            type: "human",
            data: {
              content: message,
            },
          },
          {
            type: "loading",
            data: {
              content: "Please wait while your query is being processed...",
            },
          },
        ]);
        setMessage("");
      }}
    >
      {error.length > 0 && (
        <Typography variant="h6" color="error">
          {error}
        </Typography>
      )}
      <TextField
        className={styles.inputContainer}
        variant="standard"
        sx={{ width: "100%" }}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type your query"
        inputProps={{
          sx: {
            fontSize: "1.4rem",
          },
        }}
        InputProps={{
          disableUnderline: true,
          className: styles.input,
          endAdornment: (
            <button type="submit" className={styles.sendbtn}>
              <svg xmlns="http://www.w3.org/2000/svg" width={15} height={15} viewBox="0 0 15 15" fill="none">
                <path
                  d="M14.9255 2.25272C15.2786 1.27588 14.332 0.329289 13.3552 0.683239L1.41652 5.00094C0.436417 5.35571 0.317889 6.69304 1.21952 7.21538L5.03041 9.42164L8.4334 6.01865C8.58757 5.86975 8.79406 5.78736 9.00839 5.78922C9.22272 5.79108 9.42774 5.87705 9.5793 6.02861C9.73086 6.18017 9.81683 6.38519 9.81869 6.59952C9.82056 6.81385 9.73816 7.02034 9.58926 7.17451L6.18627 10.5775L8.39335 14.3884C8.91487 15.29 10.2522 15.1707 10.607 14.1914L14.9255 2.25272Z"
                  fill="#111827"
                />
              </svg>
            </button>
          ),
        }}
      />
    </Box>
  );
};

export default AskQuestionForm;
