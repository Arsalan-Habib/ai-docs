"use client";

import { createUser } from "@/actions/createUser";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Snackbar from "@mui/material/Snackbar";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";

import { useFormState, useFormStatus } from "react-dom";
import Button from "../Button/Button";
import styles from "./SignupForm.module.css";

const zodErrors: {
  email?: string[];
  password?: string[];
  confirmPassword?: string[];
} = {
  email: undefined,
  password: undefined,
  confirmPassword: undefined,
};

const initialState = {
  fieldErrors: zodErrors,
  message: "",
  status: false,
};

const SignupButton = () => {
  const { pending } = useFormStatus();

  return (
    <Button variant="contained" class={styles.signupbtn} type="submit" disabled={pending}>
      {pending && <CircularProgress size={"1.5rem"} color="inherit" />}
      <span>Sign up</span>
    </Button>
  );
};

const SignupForm = () => {
  const [state, formAction] = useFormState(createUser, initialState);

  return (
    <div className={styles.root}>
      <Snackbar open={!!state.message} autoHideDuration={5000} anchorOrigin={{ vertical: "top", horizontal: "center" }}>
        <Alert
          severity={state.status ? "success" : "error"}
          variant="filled"
          sx={{ display: "flex", alignItems: "center", fontSize: "1.3rem" }}
        >
          {state.message}
        </Alert>
      </Snackbar>
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
          <Box>
            <TextField
              placeholder="Email"
              name="email"
              sx={{ width: "100%" }}
              inputProps={{ style: { fontSize: "1.4rem" } }}
              error={state.fieldErrors?.email && state.fieldErrors.email.length > 0}
            />
            {state.fieldErrors?.email && state.fieldErrors.email.length > 0 && (
              <Typography color="error">{state.fieldErrors.email[0]}</Typography>
            )}
          </Box>
          <Box>
            <TextField
              placeholder="Password"
              name="password"
              sx={{ width: "100%" }}
              type="password"
              inputProps={{ style: { fontSize: "1.4rem" } }}
              error={state.fieldErrors?.password && state.fieldErrors.password.length > 0}
            />
            {state.fieldErrors?.password && state.fieldErrors.password.length > 0 && (
              <Typography color="error">{state.fieldErrors.password[0]}</Typography>
            )}
          </Box>
          <Box>
            <TextField
              placeholder="Confirm Password"
              name="confirmPassword"
              sx={{ width: "100%" }}
              type="password"
              inputProps={{ style: { fontSize: "1.4rem" } }}
              error={state.fieldErrors?.confirmPassword && state.fieldErrors.confirmPassword.length > 0}
            />
            {state.fieldErrors?.confirmPassword && state.fieldErrors.confirmPassword.length > 0 && (
              <Typography color="error">{state.fieldErrors.confirmPassword[0]}</Typography>
            )}
          </Box>
        </Box>

        <SignupButton />
      </Box>
    </div>
  );
};

export default SignupForm;
