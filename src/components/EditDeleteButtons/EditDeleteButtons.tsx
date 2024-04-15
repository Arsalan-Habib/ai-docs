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
  Divider,
  IconButton,
  Menu,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import styles from "./styles.module.css";
import MoveToIcon from "@/icons/MoveToIcon";
import { moveGroupToFolder } from "@/actions/moveGroupToFolder";

const EditDeleteButtons = ({
  id,
  className,
  name,
  folders,
  type,
}: {
  id: string;
  className?: string;
  name: string;
  folders?: any[];
  type: "folder" | "group";
}) => {
  const router = useRouter();
  const [openEditModal, setOpenEditModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [openMoveToModal, setOpenMoveToModal] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState<string>("null");

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

  const handleMoveTo = async () => {
    await moveGroupToFolder(id, selectedFolder);

    setOpenMoveToModal(false);
  };

  const dialogContent = {
    folder: "By deleting the folder all the documents inside it will be deleted. Do you want to proceed?",
    group: "Are you sure you want to delete this group?",
  };

  return (
    <div style={{ position: "absolute", right: 0, zIndex: 2, display: "flex" }} className={className}>
      <IconButton onClick={() => setOpenEditModal(true)}>
        <EditIcon />
      </IconButton>
      {type === "group" && !!folders && folders.length > 0 && (
        <>
          <IconButton onClick={() => setOpenMoveToModal(true)}>
            <MoveToIcon />
          </IconButton>
          <Dialog fullWidth={true} maxWidth={"xs"} open={openMoveToModal} onClose={() => setOpenMoveToModal(false)}>
            <DialogContent>
              <Box
                component="form"
                // onSubmit={handleSubmit}
                action={() => handleMoveTo()}
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
                <h2>Move To Folder</h2>
                <div style={{ width: "100%" }}>
                  <Select
                    sx={{ width: "100%", fontSize: "1.4rem" }}
                    id="demo-simple-select"
                    value={selectedFolder}
                    native={false}
                    defaultValue=""
                    renderValue={(selected) => {
                      console.log("selected", selected);

                      if (selected === "null") {
                        return <em>Select Folder</em>;
                      }

                      const foldername = folders.find((folder) => folder._id === selected)?.name || "";

                      return foldername;
                    }}
                    // label="Select Folder"
                    onChange={(e) => setSelectedFolder(e.target.value)}
                  >
                    <MenuItem value={"null"} disabled sx={{ fontSize: "1.4rem" }}>
                      Select Folder
                    </MenuItem>

                    {folders.map((folder) => (
                      <MenuItem key={folder._id} value={folder._id} sx={{ fontSize: "1.4rem" }}>
                        {folder.name}
                      </MenuItem>
                    ))}
                  </Select>
                </div>

                <button className={styles.updateBtn} type="submit">
                  Move
                </button>
              </Box>
            </DialogContent>
          </Dialog>
        </>
      )}
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
