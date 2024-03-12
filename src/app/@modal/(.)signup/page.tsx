import { Modal } from "@/components/Modal/modal";
import SignupForm from "@/components/SignupForm/SignupForm";
import React from "react";

const Signup = () => {
  return (
    <Modal sx={{ minWidth: "800px" }}>
      <SignupForm />
    </Modal>
  );
};

export default Signup;
