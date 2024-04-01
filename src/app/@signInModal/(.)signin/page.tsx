import { Modal } from "@/components/Modal/modal";
import SignInForm from "@/components/SignInForm/SignInForm";
import NextAuthProvider from "@/providers/NextAuthProvider";
import React from "react";

const Signup = () => {
  return (
    <Modal>
      <div>
        <NextAuthProvider>
          <SignInForm />
        </NextAuthProvider>
      </div>
    </Modal>
  );
};

export default Signup;
