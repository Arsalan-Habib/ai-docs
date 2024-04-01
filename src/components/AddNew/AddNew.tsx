"use client";

import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import Divider from "@mui/material/Divider";
import Box from "@mui/material/Box";
import { useState } from "react";
import AddDocumentsDialog from "../AddDocumentsDialog/AddDocumentsDialog";
import AddFolderDialog from "../AddFolderDialog/AddFolderDialog";
import styles from "./AddNew.module.css";

const AddNew = () => {
  const [open, setOpen] = useState(false);
  const [openFolderModal, setOpenFolderModal] = useState(false);
  const [openDocumentsModal, setDocumentsModal] = useState(false);
  const [formId, setFormId] = useState(() => crypto.randomUUID());
  const [formId2, setFormId2] = useState(() => crypto.randomUUID());
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
              className={styles.addContainer}
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
            <div
              className={styles.addContainer}
              style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem" }}
              onClick={() => {
                setOpen(false);
                setFormId2(crypto.randomUUID());
                setDocumentsModal(true);
              }}
            >
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

      <AddDocumentsDialog key={formId2} open={openDocumentsModal} handleClose={() => setDocumentsModal(false)} />
    </div>
  );
};

export default AddNew;
