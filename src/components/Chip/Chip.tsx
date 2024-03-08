import React from "react";
import styles from "./Chip.module.css";

interface ChipProps {
  label: string;
}

const Chip = ({ label }: ChipProps) => {
  return (
    <div className={styles.root}>
      <h6>{label}</h6>
    </div>
  );
};

export default Chip;
