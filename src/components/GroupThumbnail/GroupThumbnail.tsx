import { IDocGroupWithFileUrls } from "@/schemas/DocGroup";
import Link from "next/link";
import React from "react";
import { Document as PDFDoc, Page } from "react-pdf";
import styles from "./GroupThumbnail.module.css";
import { Badge } from "@mui/material";

const GroupThumbnail = ({ group }: { group: IDocGroupWithFileUrls }) => {
  const fileUrls = group.fileUrls.filter((_, i) => i <= 3);

  const remainingFiles = group.fileUrls.length - fileUrls.length;

  console.log("remainingFiles", remainingFiles);

  return (
    <Link
      key={group.groupId}
      href={`/chat/${group.groupId}`}
      style={{
        maxWidth: "160px",
        textDecoration: "none",
        color: "black",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <Badge invisible={remainingFiles === 0} badgeContent={`+${remainingFiles}`} color="primary">
        <div className={fileUrls.length === 1 ? styles.groupContainerFixed : styles.groupContainer}>
          {fileUrls.map((url, i) => {
            return (
              <PDFDoc file={url} className={styles.pdfDoc} key={i} renderMode="canvas" loading="Generating Thumbnail">
                <Page
                  key={`page_1`}
                  pageNumber={1}
                  className={styles.pdfPage}
                  renderTextLayer={false}
                  renderAnnotationLayer={false}
                />
              </PDFDoc>
            );
          })}
        </div>
      </Badge>
      <h3 style={{ textAlign: "center" }}>{group.groupName}</h3>
    </Link>
  );
};

export default GroupThumbnail;
