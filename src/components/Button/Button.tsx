import React from "react";
import styles from "./Button.module.css";

interface ButtonProps {
  children: React.ReactNode;
  class?: string;
  variant?: "outlined" | "contained";
  type?: "submit" | "button";
  disabled?: boolean;
  onClick?: () => void;
}

const Button = ({
  children,
  variant = "outlined",
  class: myClass,
  onClick,
  type = "button",
  disabled,
}: ButtonProps) => {
  const className = variant === "outlined" ? styles.outlined : styles.contained;

  return (
    <button className={`${styles.root} ${className} ${myClass}`} type={type} disabled={disabled} onClick={onClick}>
      {children}
    </button>
  );
};

export default Button;
