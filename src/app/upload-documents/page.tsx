"use client";

// TODOS:
// 1) upload files to s3, create vectors and store both in db
// 2) select the group that you want to communicate with

import React, { useCallback, useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import styles from "./uploadDocuments.module.css";
import Button from "@/components/Button/Button";
import { Box, Chip } from "@mui/material";
import Header from "@/components/Header/Header";

const UploadDocuments = () => {
  const [filesSrc, setFilesSrc] = useState<File[]>([]);

  const onDrop = useCallback((acceptedFiles: any[]) => {
    setFilesSrc((files) => [...files, ...acceptedFiles]);

    // Do something with the files
  }, []);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const formdata = new FormData();

    // formdata.append("file", file)
    for (let i = 0; i < filesSrc.length; i++) {
      formdata.append("file", filesSrc[i]);
    }

    const res = await fetch("/api/upload-files", {
      method: "POST",
      body: formdata,
    });

    // console.log(filesSrc);
    const result = await res.json();

    console.log("result", result);
  }

  return (
    <div>
      <Header />

      <Box component="form" className={styles.root} onSubmit={handleSubmit}>
        <h1 className={styles.mainHeading}>Create New Chat</h1>
        <p className={styles.description}>
          Upload your documents here, and your chat will be ready. <br /> You
          can ask or search anything mentioned in the document.
        </p>
        <div {...getRootProps()} className={styles.dropzone}>
          <input {...getInputProps()} />
          {isDragActive ? (
            <p>Drop the files here ...</p>
          ) : (
            <>
              <p>
                Drag &apos;n&apos; drop some files here, or click to select
                files
              </p>
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
            return <Chip key={i} label={file.name} />;
          })}
        </div>
        <Button class={styles.uploadbtn} type="submit">
          Upload
        </Button>
      </Box>
    </div>
  );
};

export default UploadDocuments;
