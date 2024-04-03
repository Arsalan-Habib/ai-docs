"use client";

import DeleteIcon from "@/icons/DeleteIcon";
import EditIcon from "@/icons/EditIcon";
import {
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  TextField,
} from "@mui/material";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import styles from "./styles.module.css";

const EditDeleteButtons = ({
  id,
  className,
  name,
  type,
}: {
  id: string;
  className?: string;
  name: string;
  type: "folder" | "group";
}) => {
  const router = useRouter();
  const [openEditModal, setOpenEditModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);

  async function handleDelete() {
    const res = await fetch(`/api/${type}/${id}`, {
      method: "DELETE",
    });
    const data = await res.json();

    setOpenDeleteModal(false);
    router.refresh();
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const body = Object.fromEntries(formData);

    const res = await fetch(`/api/${type}/${id}`, {
      method: "PUT",
      body: JSON.stringify(body),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await res.json();
    setOpenEditModal(false);
    router.refresh();
  }

  const dialogContent = {
    folder: "By deleting the folder all the documents inside it will be deleted. Do you want to proceed?",
    group: "Are you sure you want to delete this group?",
  };

  return (
    <div style={{ position: "absolute", right: 0, zIndex: 2, display: "flex" }} className={className}>
      <IconButton onClick={() => setOpenEditModal(true)}>
        <EditIcon />
      </IconButton>
      <IconButton onClick={() => setOpenDeleteModal(true)}>
        <DeleteIcon />
      </IconButton>

      <Dialog fullWidth={true} maxWidth={"xs"} open={openEditModal} onClose={() => setOpenEditModal(false)}>
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
            <h2>Update {type[0].toUpperCase() + type.substring(1)} Name</h2>
            <div style={{ width: "100%" }}>
              <TextField
                placeholder={`${type[0].toUpperCase() + type.substring(1)} Name`}
                variant="standard"
                name="name"
                defaultValue={name}
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
      <Dialog fullWidth={true} maxWidth={"xs"} open={openDeleteModal} onClose={() => setOpenDeleteModal(false)}>
        <DialogContent>
          <DialogTitle id="alert-dialog-title" sx={{ fontSize: "2rem" }}>
            Delete this {type}?
          </DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description" sx={{ fontSize: "1.5rem" }}>
              {dialogContent[type]}
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <button className={styles.cancelBtn} onClick={() => setOpenDeleteModal(false)}>
              Cancel
            </button>
            <button className={styles.deleteBtn} onClick={handleDelete}>
              Delete
            </button>
          </DialogActions>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EditDeleteButtons;
