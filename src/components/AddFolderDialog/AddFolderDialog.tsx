"use client";

import DialogContent from "@mui/material/DialogContent/DialogContent";
import TextField from "@mui/material/TextField/TextField";
import Dialog from "@mui/material/Dialog/Dialog";
import Box from "@mui/material/Box/Box";
import React, { useEffect } from "react";
import styles from "./AddFolderDialog.module.css";
import { useFormState } from "react-dom";
import { addFolder } from "@/actions/addFolder";

const initialState = {
  status: false,
  message: "",
};

const AddFolderDialog = ({ open, handleClose }: { open: boolean; handleClose: () => void }) => {
  let [state, formAction] = useFormState(addFolder, initialState);

  useEffect(() => {
    if (state.status) {
      handleClose();
    }
  }, [state, handleClose]);

  return (
    <Dialog fullWidth={true} maxWidth={"xs"} open={open} onClose={handleClose}>
      <DialogContent>
        <Box
          component="form"
          action={formAction}
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
          <h2>Enter Folder Name</h2>
          <div style={{ width: "100%" }}>
            <TextField
              placeholder="Folder Name"
              variant="standard"
              name="name"
              InputProps={{
                disableUnderline: true,
              }}
              inputProps={{
                sx: {
                  fontSize: "1.5rem",
                },
              }}
              sx={{
                border: !state.status && state.message !== "" ? "1px solid red" : "1px solid var(--secondary-color)",
                borderRadius: "0.8rem",
                width: "100%",
                px: 2,
                py: 1,
                background: `var(--secondary-color)`,
              }}
            />
            <span style={{ color: "red", marginTop: "0.5rem" }}>{state.message}</span>
          </div>

          <button className={styles.createBtn}>Create</button>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default AddFolderDialog;
