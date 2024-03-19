"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import styles from "./uploadDocuments.module.css";
import Button from "@/components/Button/Button";
import { Alert, AlertTitle, Box, Chip, CircularProgress, Snackbar } from "@mui/material";
import Header from "@/components/Header/Header";
import { useRouter } from "next/navigation";

const UploadDocuments = () => {
  const [filesSrc, setFilesSrc] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useRouter();

  const onDrop = useCallback((acceptedFiles: any[]) => {
    setFilesSrc((files) => [...files, ...acceptedFiles]);

    // Do something with the files
  }, []);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formdata = new FormData();

    // formdata.append("file", file)
    for (let i = 0; i < filesSrc.length; i++) {
      formdata.append("file", filesSrc[i]);
    }

    const res = await fetch("/api/upload-files", {
      method: "POST",
      body: formdata,
    });

    const result = await res.json();

    if (result.success) {
      navigate.push(`/chat/${result.data.groupId}`);
    }

    if (!result.success) {
      setError(result.message);
    }

    setLoading(false);
  }

  return (
    <div>
      <Snackbar
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        open={!!error}
        sx={{ display: "flex", alignItems: "center", minWidth: "15%" }}
        autoHideDuration={5000}
        onClose={() => setError("")}
      >
        <Alert variant="filled" severity="error" sx={{ fontSize: "1.5rem", width: "100%" }}>
          <AlertTitle sx={{ fontSize: "1.7rem" }}>Error</AlertTitle>
          {error}
        </Alert>
      </Snackbar>
      <Header />

      <Box component="form" className={styles.root} onSubmit={handleSubmit}>
        <h1 className={styles.mainHeading}>Create New Chat</h1>
        <p className={styles.description}>
          Upload your documents here, and your chat will be ready. <br /> You can ask or search anything mentioned in
          the document.
        </p>
        <div {...getRootProps()} className={styles.dropzone}>
          <input {...getInputProps()} />
          {isDragActive ? (
            <p>Drop the files here ...</p>
          ) : (
            <>
              <p>Drag &apos;n&apos; drop some files here, or click to select files</p>
            </>
          )}
        </div>
        <div
          style={{
            marginTop: "1rem",
            display: "flex",
            flexWrap: "wrap",
            gap: "1rem",
            justifyContent: "center",
          }}
        >
          {filesSrc.map((file, i) => {
            return <Chip key={i} label={file.name} sx={{ fontSize: "1.4rem" }} />;
          })}
        </div>
        <Button class={styles.uploadbtn} type="submit" disabled={loading || filesSrc.length === 0}>
          {loading && <CircularProgress size={"1.5rem"} color="inherit" />}
          <span>Upload</span>
        </Button>
      </Box>
    </div>
  );
};

export default UploadDocuments;
