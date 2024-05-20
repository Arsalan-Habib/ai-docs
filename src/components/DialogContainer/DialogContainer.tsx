"use client";

import { Alert, Snackbar } from "@mui/material";
import React, { useState } from "react";
import AddNew from "../AddNew/AddNew";

const DialogContainer = () => {
  const [isError, setIsError] = useState(false);

  const handleClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === "clickaway") {
      return;
    }

    setIsError(false);
  };

  return (
    <>
      <Snackbar open={isError} onClose={handleClose}>
        <Alert onClose={handleClose} severity="error" variant="filled" sx={{ width: "100%", fontSize: "1.2rem" }}>
          Something went wrong, Please try again.
        </Alert>
      </Snackbar>

      <AddNew setIsError={setIsError} />
    </>
  );
};

export default DialogContainer;
