"use client";

import React from "react";
import styles from "./SignInForm.module.css";
import { Box, Divider, TextField } from "@mui/material";
import Button from "../Button/Button";
import { signIn } from "next-auth/react";

const SignInForm = () => {
  return (
    <div>
      <div className={styles.formHead}>
        <h1>Sign in</h1>
        <p>Please login to continue to your account.</p>
      </div>

      <Box
        component="form"
        sx={{ mt: 4 }}
        onSubmit={(e) => {
          e.preventDefault();
          const formdata = new FormData(e.currentTarget);

          signIn("credentials", {
            redirect: true,
            callbackUrl: "/",
            email: formdata.get("email"),
            password: formdata.get("password"),
          });
        }}
      >
        <TextField
          type="email"
          sx={{ width: "100%" }}
          placeholder="Email"
          name="email"
        />
        <TextField
          type="password"
          sx={{ width: "100%", mb: 2 }}
          placeholder="Password"
          name="password"
        />

        <Button variant="contained" type="submit">
          Sign in
        </Button>

        <Divider sx={{ width: "100%", mt: 2, mb: 2 }}>or</Divider>
      </Box>
      <Button onClick={() => signIn("google")}>Sign in with Google</Button>
    </div>
  );
};

export default SignInForm;
