"use client";

import { Alert, Snackbar } from "@mui/material";
import React, { useState } from "react";
import AddNew from "../AddNew/AddNew";

const DialogContainer = ({ children }: { children: React.ReactNode }) => {
  const [isError, setIsError] = useState(false);

  const handleClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === "clickaway") {
      return;
    }

    setIsError(false);
  };

  const childrenWithProps = React.Children.map(children, (child) => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child, { setIsError } as React.HTMLAttributes<HTMLElement>);
    }

    return child;
  }) as React.ReactElement[];

  return (
    <>
      <Snackbar open={isError} onClose={handleClose}>
        <Alert onClose={handleClose} severity="error" variant="filled" sx={{ width: "100%", fontSize: "1.2rem" }}>
          Something went wrong, Please try again.
        </Alert>
      </Snackbar>

      {childrenWithProps}
    </>
  );
};

export default DialogContainer;
