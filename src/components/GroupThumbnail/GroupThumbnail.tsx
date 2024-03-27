import { IDocGroupWithFileUrls } from "@/schemas/DocGroup";
import Link from "next/link";
import React from "react";
import { Document as PDFDoc, Page } from "react-pdf";
import styles from "./GroupThumbnail.module.css";

const GroupThumbnail = ({ group }: { group: IDocGroupWithFileUrls }) => {
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
      <div className={styles.groupContainer}>
        {group.fileUrls.map((url, i) => {
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
      <h3 style={{ textAlign: "center" }}>{group.groupName}</h3>
    </Link>
  );
};

export default GroupThumbnail;
