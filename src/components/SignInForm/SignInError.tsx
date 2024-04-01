"use client";

import { AuthErrorTypes } from "@/types";
import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";
import Snackbar from "@mui/material/Snackbar";
import { useSearchParams } from "next/navigation";
import React from "react";

const errors = {
  [AuthErrorTypes.Signin]: "Try signing with a different account.",
  [AuthErrorTypes.OAuthSignin]: "Try signing with a different account.",
  [AuthErrorTypes.OAuthCallback]: "Try signing with a different account.",
  [AuthErrorTypes.OAuthCreateAccount]: "Try signing with a different account.",
  [AuthErrorTypes.EmailCreateAccount]: "Try signing with a different account.",
  [AuthErrorTypes.Callback]: "Try signing with a different account.",
  [AuthErrorTypes.OAuthAccountNotLinked]:
    "To confirm your identity, sign in with the same account you used originally.",
  [AuthErrorTypes.EmailSignin]: "Check your email address.",
  [AuthErrorTypes.CredentialsSignin]: "Sign in failed. Make sure the details you provided are correct.",
  [AuthErrorTypes.default]: "Unable to sign in.",
};

const SignInError = () => {
  const searchParams = useSearchParams();

  const error = searchParams.get("error");
  const errorMessage = error && (errors[error as AuthErrorTypes] ?? errors.default);
  return (
    <Snackbar anchorOrigin={{ vertical: "top", horizontal: "right" }} open={!!error} sx={{ minWidth: "15%" }}>
      <Alert severity="error" sx={{ fontSize: "1.4rem", width: "100%" }}>
        <AlertTitle sx={{ fontSize: "1.8rem" }}>Error</AlertTitle>
        {errorMessage}
      </Alert>
    </Snackbar>
  );
};

export default SignInError;
