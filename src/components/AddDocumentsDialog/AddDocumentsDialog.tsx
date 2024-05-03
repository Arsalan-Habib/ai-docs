"use client";

import { createPresignedUrl } from "@/actions/createPreSignedUrl";
import DialogContent from "@mui/material/DialogContent";
import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Chip from "@mui/material/Chip";
import Dialog from "@mui/material/Dialog";
import { randomBytes } from "crypto";
import { useParams, useRouter } from "next/navigation";
import PDFMerger from "pdf-merger-js/browser";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { useDropzone } from "react-dropzone";
import styles from "./AddDocumentsDialog.module.css";
import { UploadStages } from "@/types";
import InfoIcon from "@/icons/InfoIcon";
import CheckIcon from "@/icons/CheckIcon";
import { pdfjs } from "react-pdf";
import { client } from "@/utils";

async function uploadFile(url: string, data: ArrayBuffer) {
  try {
    const res = await fetch(url, {
      method: "PUT",
      headers: { "Content-Length": new Blob([data]).size.toString(), "Cache-control": "max-age=31536000, public" },
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

const ProgressIndicator = ({
  isInactive,
  isActive,
  isCompleted,
}: {
  isInactive: boolean;
  isActive: boolean;
  isCompleted: boolean;
}) => {
  if (isInactive) {
    return <InfoIcon />;
  }

  if (isActive) {
    return <CircularProgress size={20} color="inherit" />;
  }

  if (isCompleted) {
    return <CheckIcon />;
  }
};

const AddDocumentsDialog = ({ open, handleClose }: { open: boolean; handleClose: () => void }) => {
  const [filesSrc, setFilesSrc] = useState<File[]>([]);
  const params = useParams();
  const [loading, setLoading] = useState(false);
  const [preSignedUrls, setPresignedUrls] = useState<string[]>([]);
  const [currentStage, setCurrentStage] = useState<UploadStages | null>(null);
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
        const file = await acceptedFiles[i].arrayBuffer();

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

      // await new Promise((resolve) => setTimeout(resolve, 3000));

      // const files = formdata.getAll("file") as File[];

      const merger = new PDFMerger();

      setCurrentStage(UploadStages.CLOUD_UPLOADING);
      await Promise.all(
        filesSrc.map(async (file, i) => {
          const Body = (await file.arrayBuffer()) as Buffer;
          await uploadFile(preSignedUrls[i], Body);

          await merger.add(file);
        }),
      );

      if (filesSrc.length > 1) {
        setCurrentStage(UploadStages.MERGING_PDF);
        const mergedPdfBuffer = await merger.saveAsBuffer();
        const randomFilename = `${Date.now()}-${randomBytes(6).toString("hex")}.pdf`;

        formdata.append("mergedFilename", randomFilename);

        const mergedPdfPresignedUrl = await createPresignedUrl({ key: randomFilename });

        await uploadFile(mergedPdfPresignedUrl, mergedPdfBuffer);
      } else {
        const filenames = formdata.getAll("filename") as string[];

        formdata.append("mergedFilename", filenames[0]);
      }

      setCurrentStage(UploadStages.STORE_EMBEDDINGS);
      const res = await fetch("/api/upload-files", {
        method: "POST",
        body: formdata,
      });

      const data = await res.json();

      await new Promise((resolve) => setTimeout(resolve, 1000));
      setCurrentStage(UploadStages.UPLOADING_COMPLETE);

      setLoading(false);

      handleClose();
      router.refresh();
    } catch (error) {
      console.log("error", error);
    }
  }

  return (
    <Dialog fullWidth={true} maxWidth={"sm"} open={open} onClose={() => (loading ? null : handleClose())}>
      <DialogContent>
        {!loading && (
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
                            return <Chip key={i} label={file.name} sx={{ fontSize: "1.2rem" }} />;
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
        )}
        {loading && (
          <Box sx={{ padding: "4rem" }}>
            <h1>Document(s) Uploading In Progress</h1>
            <div className={styles.progressContainer}>
              <div className={styles.progress}>
                <ProgressIndicator
                  isInactive={currentStage === null}
                  isActive={currentStage === UploadStages.CLOUD_UPLOADING}
                  isCompleted={
                    currentStage === UploadStages.MERGING_PDF ||
                    currentStage === UploadStages.STORE_EMBEDDINGS ||
                    currentStage === UploadStages.UPLOADING_COMPLETE
                  }
                />
                <p>Uploading Documents to cloud</p>
              </div>
              {filesSrc.length > 1 && (
                <div className={styles.progress}>
                  <ProgressIndicator
                    isInactive={currentStage === null || currentStage === UploadStages.CLOUD_UPLOADING}
                    isActive={currentStage === UploadStages.MERGING_PDF}
                    isCompleted={
                      currentStage === UploadStages.STORE_EMBEDDINGS || currentStage === UploadStages.UPLOADING_COMPLETE
                    }
                  />
                  <p>Merging Documents</p>
                </div>
              )}
              <div className={styles.progress}>
                <ProgressIndicator
                  isInactive={
                    currentStage === null ||
                    currentStage === UploadStages.CLOUD_UPLOADING ||
                    currentStage === UploadStages.MERGING_PDF
                  }
                  isActive={currentStage === UploadStages.STORE_EMBEDDINGS}
                  isCompleted={currentStage === UploadStages.UPLOADING_COMPLETE}
                />
                <p>Storing Embeddings</p>
              </div>
              <div className={styles.progress}>
                <ProgressIndicator
                  isInactive={
                    currentStage === null ||
                    currentStage === UploadStages.CLOUD_UPLOADING ||
                    currentStage === UploadStages.MERGING_PDF ||
                    currentStage === UploadStages.STORE_EMBEDDINGS
                  }
                  isActive={currentStage === UploadStages.UPLOADING_COMPLETE}
                  isCompleted={currentStage === UploadStages.UPLOADING_COMPLETE}
                />
                <p>Upload Complete</p>
              </div>
            </div>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AddDocumentsDialog;
