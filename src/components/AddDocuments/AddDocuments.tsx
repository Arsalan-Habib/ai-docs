"use client";

import React, { useState } from "react";
import styles from "./AddDocuments.module.css";
import AddDocumentsDialog from "../AddDocumentsDialog/AddDocumentsDialog";
import DialogContainer from "../DialogContainer/DialogContainer";

const AddDocuments = () => {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <div className={styles.addNewContainer} onClick={() => setOpen(true)}>
        <div className={styles.addNew}>
          <span>+</span>
        </div>
        <h3>Upload Documents</h3>
      </div>

      <DialogContainer>
        <AddDocumentsDialog open={open} handleClose={() => setOpen(false)} />
      </DialogContainer>
    </div>
  );
};

export default AddDocuments;
