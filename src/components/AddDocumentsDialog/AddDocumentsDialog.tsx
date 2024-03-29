"use client";

import { createPresignedUrl } from "@/actions/createPreSignedUrl";
import { Box, Chip, CircularProgress, Dialog, DialogContent, TextField } from "@mui/material";
import { randomBytes } from "crypto";
import { useParams, useRouter } from "next/navigation";
import PDFMerger from "pdf-merger-js/browser";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { useDropzone } from "react-dropzone";
import styles from "./AddDocumentsDialog.module.css";

async function uploadFile(url: string, data: ArrayBuffer) {
  try {
    const res = await fetch(url, {
      method: "PUT",
      headers: { "Content-Length": new Blob([data]).size.toString() },
      body: data,
    });

    if (!res.ok) {
      throw new Error("Failed to upload file");
    }

    return res;
  } catch (error: any) {
    console.log("error", error);
    throw new Error(error);
  }
}

const UploadButton = ({ canUpload, loading }: { canUpload: boolean; loading: boolean }) => {
  return (
    <button className={styles.createBtn} disabled={!canUpload || loading} type="submit">
      {loading && <CircularProgress size={"1.2rem"} color="inherit" />}
      <span>Upload</span>
    </button>
  );
};

const AddDocumentsDialog = ({ open, handleClose }: { open: boolean; handleClose: () => void }) => {
  const [filesSrc, setFilesSrc] = useState<File[]>([]);
  const params = useParams();
  const [loading, setLoading] = useState(false);
  const [preSignedUrls, setPresignedUrls] = useState<string[]>([]);
  const router = useRouter();
  const [groupName, setGroupName] = useState("");
  const formdata = useMemo(() => new FormData(), []);

  const onDrop = useCallback(
    async (acceptedFiles: any[]) => {
      setFilesSrc((files) => [...files, ...acceptedFiles]);

      for (let i = 0; i < acceptedFiles.length; i++) {
        const filename = `${Date.now()}-${acceptedFiles[i].name}`;
        // formdata.append("file", acceptedFiles[i]);
        formdata.append("filename", filename);
        const clientUrl = await createPresignedUrl({ key: filename });

        setPresignedUrls((prevUrls) => [...prevUrls, clientUrl]);
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

  useEffect(() => {
    if (formdata.get("folderId")) {
      formdata.delete("folderId");
    }
    formdata.append("folderId", params.folderId as string);
  }, [formdata, params.folderId]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    try {
      e.preventDefault();
      setLoading(true);

      await new Promise((resolve) => setTimeout(resolve, 3000));

      // const files = formdata.getAll("file") as File[];

      const merger = new PDFMerger();

      await Promise.all(
        filesSrc.map(async (file, i) => {
          const Body = (await file.arrayBuffer()) as Buffer;
          await uploadFile(preSignedUrls[i], Body);

          await merger.add(file);
        }),
      );

      const mergedPdfBuffer = await merger.saveAsBuffer();
      const randomFilename = `${Date.now()}-${randomBytes(6).toString("hex")}.pdf`;

      formdata.append("mergedFilename", randomFilename);

      const mergedPdfPresignedUrl = await createPresignedUrl({ key: randomFilename });

      await uploadFile(mergedPdfPresignedUrl, mergedPdfBuffer);

      const res = await fetch("/api/upload-files", {
        method: "POST",
        body: formdata,
      });

      const data = await res.json();

      setLoading(false);
      handleClose();
      router.refresh();
    } catch (error) {
      console.log("error", error);
    }
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
          <UploadButton canUpload={filesSrc.length > 0} loading={loading} />
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default AddDocumentsDialog;
