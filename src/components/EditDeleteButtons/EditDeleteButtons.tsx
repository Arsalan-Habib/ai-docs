"use client";

import DeleteIcon from "@/icons/DeleteIcon";
import EditIcon from "@/icons/EditIcon";
import { Box, Dialog, DialogContent, IconButton, TextField } from "@mui/material";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import styles from "./styles.module.css";

const EditDeleteButtons = ({
  folderId,
  className,
  folderName,
}: {
  folderId: string;
  className?: string;
  folderName: string;
}) => {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const handleClose = () => {
    setOpen(false);
  };

  async function handleDelete() {
    const res = await fetch(`/api/folder/${folderId}`, {
      method: "DELETE",
    });
    const data = await res.json();

    router.refresh();
    console.log(data);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const body = Object.fromEntries(formData);

    const res = await fetch(`/api/folder/${folderId}`, {
      method: "PUT",
      body: JSON.stringify(body),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await res.json();
    console.log("data", data);
    handleClose();
    router.refresh();
  }

  return (
    <div style={{ position: "absolute", right: 0, zIndex: 2, display: "flex" }} className={className}>
      <IconButton onClick={() => setOpen(true)}>
        <EditIcon />
      </IconButton>
      <IconButton onClick={() => handleDelete()}>
        <DeleteIcon />
      </IconButton>

      <Dialog fullWidth={true} maxWidth={"xs"} open={open} onClose={handleClose}>
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
            <h2>Update Folder Name</h2>
            <div style={{ width: "100%" }}>
              <TextField
                placeholder="Folder Name"
                variant="standard"
                name="name"
                defaultValue={folderName}
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
            </div>

            <button className={styles.updateBtn} type="submit">
              Update
            </button>
          </Box>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EditDeleteButtons;
