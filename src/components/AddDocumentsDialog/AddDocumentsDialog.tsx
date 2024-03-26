"use client";

import { Box, Chip, Dialog, DialogContent, TextField } from "@mui/material";
import styles from "./AddDocumentsDialog.module.css";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { useParams } from "next/navigation";

const initialState = {
  status: false,
  message: "",
};

const AddDocumentsDialog = ({ open, handleClose }: { open: boolean; handleClose: () => void }) => {
  const [filesSrc, setFilesSrc] = useState<File[]>([]);
  const params = useParams();
  const [groupName, setGroupName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const onDrop = useCallback((acceptedFiles: any[]) => {
    setFilesSrc((files) => [...files, ...acceptedFiles]);

    // Do something with the files
  }, []);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formdata = new FormData();

    formdata.append("groupName", groupName);
    formdata.append("folderId", params.folderId as string);

    for (let i = 0; i < filesSrc.length; i++) {
      formdata.append("file", filesSrc[i]);
    }

    console.log(formdata.getAll("file"), formdata.get("groupName"), formdata.get("folderId"));

    const res = await fetch("/api/upload-files", {
      method: "POST",
      body: formdata,
    });

    const result = await res.json();

    if (!result.success) {
      setError(result.message);
    }

    setLoading(false);
  }

  return (
    <Dialog fullWidth={true} maxWidth={"sm"} open={open} onClose={handleClose}>
      <DialogContent>
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{
            width: "100%",
            padding: "4rem",
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
            alignItems: "center",
            m: "auto",
          }}
        >
          <h1>Upload Documents</h1>
          <div style={{ width: "100%" }}>
            <TextField
              placeholder="Your Documents Group Name"
              variant="standard"
              name="groupName"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              InputProps={{
                disableUnderline: true,
              }}
              inputProps={{
                sx: {
                  fontSize: "1.5rem",
                },
              }}
              sx={{
                borderRadius: "0.8rem",
                width: "100%",
                px: 2,
                py: 1,
                background: `var(--secondary-color)`,
              }}
            />
            <div {...getRootProps()} className={styles.dropzone}>
              <input {...getInputProps()} />
              {isDragActive ? (
                <p>Drop the files here ...</p>
              ) : (
                <>
                  {filesSrc.length === 0 ? (
                    <p>Drag &apos;n&apos; drop some files here, or click to select files</p>
                  ) : (
                    <div>
                      <p style={{ marginBottom: "1rem" }}>
                        Drag &apos;n&apos; drop some files here, or click to select files
                      </p>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem" }}>
                        {filesSrc.map((file, i) => {
                          return <Chip key={i} label={file.name} />;
                        })}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          <button className={styles.createBtn}>Upload</button>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default AddDocumentsDialog;
