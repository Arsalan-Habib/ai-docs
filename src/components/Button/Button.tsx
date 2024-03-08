import React from "react";
import styles from "./Button.module.css";

interface ButtonProps {
  children: React.ReactNode;
  variant?: "outlined" | "contained";
}

const Button = ({ children, variant = "outlined" }: ButtonProps) => {
  const className = variant === "outlined" ? styles.outlined : styles.contained;

  return <button className={`${styles.root} ${className}`}>{children}</button>;
};

export default Button;
