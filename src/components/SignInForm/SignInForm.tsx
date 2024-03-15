"use client";

import { Box, Divider, TextField, Typography } from "@mui/material";
import { signIn } from "next-auth/react";
import Button from "../Button/Button";
import styles from "./SignInForm.module.css";
import Link from "next/link";

const SignInForm = () => {
  return (
    <div className={styles.root}>
      <div className={styles.formHead}>
        <h1>Sign in</h1>
        <p>Please login to continue to your account.</p>
      </div>

      <Box
        className={styles.form}
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
          inputProps={{
            style: {
              fontSize: "1.4rem",
            },
          }}
          name="email"
        />
        <TextField
          type="password"
          sx={{ width: "100%", mb: 2 }}
          placeholder="Password"
          inputProps={{
            style: {
              fontSize: "1.4rem",
            },
          }}
          name="password"
        />

        <Button variant="contained" type="submit">
          Sign in
        </Button>
        <Divider sx={{ my: 1, width: "100%" }}  />
        <p style={{ fontSize: "1.6rem"}}>New to AI Docs? <Link href="/signup">Sign up here</Link></p>

      </Box>
    </div>
  );
};

export default SignInForm;
