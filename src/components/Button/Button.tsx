import React from "react";
import styles from "./Button.module.css";

interface ButtonProps {
  children: React.ReactNode;
  class?: string;
  variant?: "outlined" | "contained";
  type?: "submit" | "button";
}

const Button = ({
  children,
  variant = "outlined",
  class: myClass,
  type = "button",
}: ButtonProps) => {
  const className = variant === "outlined" ? styles.outlined : styles.contained;

  return (
    <button className={`${styles.root} ${className} ${myClass}`} type={type}>
      {children}
    </button>
  );
};

export default Button;
