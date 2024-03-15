"use client";

import { Box, TextField } from "@mui/material";
import { signIn } from "next-auth/react";
import Button from "../Button/Button";
import styles from "./SignInForm.module.css";

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
      </Box>
    </div>
  );
};

export default SignInForm;
