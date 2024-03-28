"use client";

import { uploadFiles } from "@/actions/uploadFiles";
import { Box, Chip, CircularProgress, Dialog, DialogContent, TextField } from "@mui/material";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { useDropzone } from "react-dropzone";
import styles from "./AddDocumentsDialog.module.css";

const UploadButton = ({ canUpload }: { canUpload: boolean }) => {
  const { pending } = useFormStatus();

  return (
    <button className={styles.createBtn} disabled={pending || !canUpload}>
      {pending && <CircularProgress size={"1.2rem"} color="inherit" />}
      <span>Upload</span>
    </button>
  );
};

const AddDocumentsDialog = ({ open, handleClose }: { open: boolean; handleClose: () => void }) => {
  const [filesSrc, setFilesSrc] = useState<File[]>([]);
  const params = useParams();
  const [groupName, setGroupName] = useState("");
  const formdata = useMemo(() => new FormData(), []);
  formdata.append("folderId", params.folderId as string);

  const onDrop = useCallback(
    (acceptedFiles: any[]) => {
      setFilesSrc((files) => [...files, ...acceptedFiles]);

      for (let i = 0; i < acceptedFiles.length; i++) {
        formdata.append("file", acceptedFiles[i]);
      }
    },
    [formdata],
  );
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  useEffect(() => {
    if (groupName.length > 0) {
      if (formdata.get("groupName")) {
        formdata.delete("groupName");
      }
      formdata.append("groupName", groupName);
    }
  }, [groupName, formdata]);

  return (
    <Dialog fullWidth={true} maxWidth={"sm"} open={open} onClose={handleClose}>
      <DialogContent>
        <Box
          component="form"
          action={() => uploadFiles(formdata)}
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
              <input {...getInputProps()} name="file" />
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
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", justifyContent: "center" }}>
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
          <UploadButton canUpload={filesSrc.length > 0} />
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default AddDocumentsDialog;
