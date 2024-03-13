"use client";

import { Box, Button, TextField } from "@mui/material";
import { useState } from "react";

const Chat = ({ params }: { params: { id: string } }) => {
  const [query, setQuery] = useState("");
  const [output, setOutput] = useState("");

  const sendQuery = async () => {
    const res = await fetch("/api/chat", {
      method: "POST",
      body: JSON.stringify({
        query,
        groupId: params.id,
      }),
    });

    const data = await res.json();

    setOutput(data.data.output);
  };

  return (
    <div style={{ width: "100%", padding: "2rem 2rem" }}>
      <Box sx={{ width: "100%", display: "flex" }}>
        <TextField
          sx={{ width: "100%" }}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Type your query"
        />

        <Button variant="contained" onClick={sendQuery}>
          Send
        </Button>
      </Box>

      <div style={{ maxWidth: "800px", marginTop: "1rem" }}>
        <h1>Answer:</h1>

        <p>{output}</p>
      </div>
    </div>
  );
};

export default Chat;
