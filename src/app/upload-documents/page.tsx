"use client";

// TODOS:
// 1) upload files to s3, create vectors and store both in db
// 2) select the group that you want to communicate with

import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import styles from "./uploadDocuments.module.css";
import Button from "@/components/Button/Button";

const UploadDocuments = () => {
  const [filesSrc, setFilesSrc] = useState<File[]>([]);

  const onDrop = useCallback((acceptedFiles: any[]) => {
    setFilesSrc((files) => [...files, ...acceptedFiles]);

    // Do something with the files
  }, []);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  return (
    <div className={styles.root}>
      <h1 className={styles.mainHeading}>Create New Chat</h1>
      <p className={styles.description}>
        Upload your documents here, and your chat will be ready. <br /> You can
        ask or search anything mentioned in the document.
      </p>
      <div {...getRootProps()} className={styles.dropzone}>
        <input {...getInputProps()} />
        {isDragActive ? (
          <p>Drop the files here ...</p>
        ) : (
          <p>
            Drag &apos;n&apos; drop some files here, or click to select files
          </p>
        )}
      </div>
      <Button class={styles.uploadbtn}>Upload</Button>
    </div>
  );
};

export default UploadDocuments;
