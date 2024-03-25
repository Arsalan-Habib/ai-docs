import { getFileUrls, getGroups } from "@/app/utils";
import { IDocGroup } from "@/schemas/DocGroup";
import { authOptions } from "@/utils/authOptions";
import { getServerSession } from "next-auth";
import React from "react";
import styles from "./library.module.css";
import Link from "next/link";
import { Page, Document as PDFDoc } from "react-pdf";

const Library = async () => {
  const session = await getServerSession(authOptions);

  const groups = await getGroups({ userId: session?.user?.id as string });

  return (
    <div className={styles.root}>
      <div className={styles.mainContainer}>
        <div>
          <h1>Library</h1>
        </div>
        <div style={{ marginTop: "1.5rem", display: "flex", gap: "2rem" }}>
          {groups.length > 0 ? (
            groups.map((group) => {
              return (
                <Link key={group.groupId} href={`/chat/${group.groupId}`}>
                  <div className={styles.groupContainer}>
                    {group.fileUrls.map((url, i) => {
                      return (
                        <PDFDoc
                          file={url}
                          className={styles.pdfDoc}
                          key={i}
                          renderMode="canvas"
                          loading="Generating Thumbnail"
                        >
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
                </Link>
              );
            })
          ) : (
            <p>No groups found</p>
          )}

          <div className={styles.addNew}>
            <span>+</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Library;

// TODO:
// User clicks on add button, the modal will open asking for selecting the choice of creating folder or documents
// If user chooses to create folder, modal will open asking for name of the folder, after creating folder the user will go into the folder where they can upload documents
// If user chooses to create documents, modal will open asking to upload documents

// The MongoDB schema will be as follows:
// The folder collection will be created with the following fields:
// name: string
// id: unique id for the folder that will be assigned automatically

// The DocGroup collection will include the following field:
// folderId: string
// If the document is in the folder then folderId will be assigned, otherwise it will be null
