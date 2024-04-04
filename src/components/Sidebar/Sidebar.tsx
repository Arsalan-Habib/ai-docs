"use client";

import { IDocGroupWithFileUrls } from "@/schemas/DocGroup";
import { Chip, Divider } from "@mui/material";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Document as PDFDoc, Page } from "react-pdf";
import Button from "../Button/Button";
import SidebarTabs from "../SidebarTabs/SidebarTabs";
import styles from "./Sidebar.module.css";

interface SidebarProps {
  groups: IDocGroupWithFileUrls[];
  groupsWithHistory: IDocGroupWithFileUrls[];
}

const Sidebar = ({ groups, groupsWithHistory }: SidebarProps) => {
  const params = useParams();

  const selectedGroup = groups.filter((group) => group.groupId === params.id);

  const remainingGroups = groupsWithHistory.filter((group) => group.groupId !== params.id);

  return (
    <div className={styles.root}>
      <Link href="/" style={{ textDecoration: "none", color: "black" }}>
        <h1>AI Docs.</h1>
      </Link>
      <SidebarTabs />

      <Link href="/library">
        <button className={styles.newchatbtn}>
          <svg xmlns="http://www.w3.org/2000/svg" width="21" height="21" viewBox="0 0 21 21" fill="none">
            <path
              d="M13.7433 1.89648H7.07666C4.31916 1.89648 2.07666 4.13898 2.07666 6.89648V17.7298C2.07666 17.9508 2.16446 18.1628 2.32074 18.3191C2.47702 18.4754 2.68898 18.5632 2.90999 18.5632H13.7433C16.5008 18.5632 18.7433 16.3207 18.7433 13.5632V6.89648C18.7433 4.13898 16.5008 1.89648 13.7433 1.89648ZM17.0767 13.5632C17.0767 15.4015 15.5817 16.8965 13.7433 16.8965H3.74333V6.89648C3.74333 5.05815 5.23833 3.56315 7.07666 3.56315H13.7433C15.5817 3.56315 17.0767 5.05815 17.0767 6.89648V13.5632Z"
              fill="#111827"
            />
            <path
              d="M6.24341 12.7193V14.3851H7.90924L12.5167 9.78348L10.8517 8.11848L6.24341 12.7193ZM13.3017 8.99848L11.6367 7.33181L12.9059 6.06348L14.5726 7.72931L13.3017 8.99848Z"
              fill="#111827"
            />
          </svg>
          <span>New Chat</span>
        </button>
      </Link>
      <div className={styles.mainContainer}>
        <div style={{ marginTop: "1.5rem" }}>
          <h2 style={{ marginBottom: "1rem", fontSize: "1.6rem" }}>Active Chat(s)</h2>
          {selectedGroup.length > 0 ? (
            selectedGroup.map((group, j) => {
              return (
                <Link key={j} href={`/chat/${group.groupId}`}>
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
            <p style={{ fontSize: "1.4rem" }}>
              Select a group from <b>library</b> to start chat
            </p>
          )}
        </div>
        <Divider sx={{ width: "100%", my: "2rem" }} />
        <div>
          <h2 style={{ marginBottom: "1rem", fontSize: "1.6rem" }}>Recent Chat(s)</h2>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem" }}>
            {remainingGroups.map((group, i) => {
              return (
                <Link key={i} href={`/chat/${group.groupId}`}>
                  <Chip
                    label={group.groupName}
                    sx={{
                      fontSize: "1.4rem",
                      padding: "2rem 1rem",
                      background: "var(--secondary-color)",
                      cursor: "pointer",
                    }}
                  />
                </Link>
              );
            })}
          </div>
        </div>
      </div>
      <Button
        variant="contained"
        onClick={async () => {
          await signOut({
            redirect: true,
            callbackUrl: "/",
          });
        }}
      >
        Logout
      </Button>
    </div>
  );
};

export default Sidebar;
