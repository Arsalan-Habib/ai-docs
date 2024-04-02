"use client";

import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Divider from "@mui/material/Divider";
import TextField from "@mui/material/TextField";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { FormEvent, Suspense, useState } from "react";
import Button from "../Button/Button";
import SignInError from "./SignInError";
import styles from "./SignInForm.module.css";

const SignInForm = () => {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formdata = new FormData(e.currentTarget);

    await signIn("credentials", {
      redirect: true,
      callbackUrl: "/library",
      email: formdata.get("email"),
      password: formdata.get("password"),
    });
    setLoading(false);
  };

  return (
    <div className={styles.root}>
      <Suspense>
        <SignInError />
      </Suspense>
      <div className={styles.formHead}>
        <h1>Sign in</h1>
        <p>Please login to continue to your account.</p>
      </div>

      <Box className={styles.form} component="form" sx={{ mt: 4 }} onSubmit={handleSubmit}>
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

        <Button variant="contained" type="submit" disabled={loading}>
          {loading && <CircularProgress size={"1.4rem"} color="inherit" />}
          <span>Sign in</span>
        </Button>
        <Divider sx={{ my: 1, width: "100%" }} />
        <p style={{ fontSize: "1.6rem" }}>
          New to AI Docs? <Link href="/signup">Sign up here</Link>
        </p>
      </Box>
    </div>
  );
};

export default SignInForm;
