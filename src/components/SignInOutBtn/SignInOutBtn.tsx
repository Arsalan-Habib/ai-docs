"use client";
import { signIn, signOut, useSession } from "next-auth/react";
import React from "react";

const SignInOutBtn = () => {
  const { status } = useSession();

  if (status === "authenticated") {
    return <button onClick={() => signOut()}>Sign Out</button>;
  }

  if (status === "loading") {
    return <button disabled>Loading...</button>;
  }

  return <button onClick={() => signIn("google")}>Sign In</button>;
};

export default SignInOutBtn;
