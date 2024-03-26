import React from "react";
import styles from "./styles.module.css";
import AddDocuments from "@/components/AddDocuments/AddDocuments";

const Folder = ({ params }: { params: { folderId: string } }) => {
  return (
    <div className={styles.root}>
      <AddDocuments />
    </div>
  );
};

export default Folder;
