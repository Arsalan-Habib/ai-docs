"use client";

import React from "react";
import styles from "./SignupForm.module.css";
import { Box, Divider, TextField, Typography } from "@mui/material";
import Button from "../Button/Button";
import { createUser } from "@/actions/createUser";
import { useFormState } from "react-dom";
import { signIn } from "next-auth/react";
import Link from "next/link";

const initialState = {
  message: "",
};

const SignupForm = () => {
  const [state, formAction] = useFormState(createUser, initialState);

  return (
    <div className={styles.root}>
      <div className={styles.formHead}>
        <h1>Sign up</h1>
        <p>Please register to start chat with your docs.</p>
      </div>
      <Box
        sx={{
          marginTop: "4rem",
          maxWidth: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          mx: "auto",
        }}
        action={formAction}
        component="form"
      >
        <Typography color={"red"}>{state?.message}</Typography>
        <Box
          sx={{
            width: "100%",
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            marginBottom: "1rem",

            gap: "1rem",
          }}
        >
          <TextField
            placeholder="First Name"
            name="firstName"
            sx={{ width: "100%" }}
            inputProps={{
              style: {
                fontSize: "1.4rem",
              },
            }}
          />
          <TextField
            placeholder="Last Name"
            sx={{ width: "100%" }}
            name="lastName"
            inputProps={{ style: { fontSize: "1.4rem" } }}
          />
          <TextField
            placeholder="Username"
            name="userName"
            sx={{ width: "100%" }}
            inputProps={{ style: { fontSize: "1.4rem" } }}
          />
          <TextField
            placeholder="Email"
            name="email"
            sx={{ width: "100%" }}
            inputProps={{ style: { fontSize: "1.4rem" } }}
          />
          <TextField
            placeholder="Password"
            name="password"
            sx={{ width: "100%" }}
            type="password"
            inputProps={{ style: { fontSize: "1.4rem" } }}
          />
          <TextField
            placeholder="Confirm Password"
            sx={{ width: "100%" }}
            type="password"
            inputProps={{ style: { fontSize: "1.4rem" } }}
          />
        </Box>

        <Button variant="contained" class={styles.signupbtn} type="submit">
          Sign up
        </Button>

      </Box>
    </div>
  );
};

export default SignupForm;
