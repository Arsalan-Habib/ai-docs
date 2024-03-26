"use client";

import React, { useState } from "react";
import styles from "./AddNew.module.css";
import { Box, Button, Dialog, DialogActions, DialogContent, DialogContentText, Divider } from "@mui/material";
import AddFolderDialog from "../AddFolderDialog/AddFolderDialog";

const AddNew = () => {
  const [open, setOpen] = useState(false);
  const [openFolderModal, setOpenFolderModal] = useState(false);
  const [formId, setFormId] = useState(() => crypto.randomUUID());
  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <div>
      <div className={styles.addNew} onClick={handleClickOpen}>
        <span>+</span>
      </div>

      <Dialog fullWidth={true} maxWidth={"sm"} open={open} onClose={handleClose}>
        <DialogContent>
          <Box
            sx={{
              display: "flex",
              padding: "4rem",
              alignItems: "center",
              gap: "6rem",
              justifyContent: "space-around",
              m: "auto",
              width: "fit-content",
            }}
          >
            <div
              style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem" }}
              onClick={() => {
                setOpen(false);
                setFormId(crypto.randomUUID());
                setOpenFolderModal(true);
              }}
            >
              <div className={styles.add}>
                <span>+</span>
              </div>
              <h3>Add Folder</h3>
            </div>
            <Divider orientation="vertical" flexItem />
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem" }}>
              <div className={styles.add}>
                <span>+</span>
              </div>
              <h3>Add Documents</h3>
            </div>
          </Box>
        </DialogContent>
      </Dialog>

      <AddFolderDialog
        key={formId}
        open={openFolderModal}
        handleClose={() => {
          setOpenFolderModal(false);
        }}
      />
    </div>
  );
};

export default AddNew;
