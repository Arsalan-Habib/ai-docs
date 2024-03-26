"use client";

import Link from "next/link";
import React from "react";
import styles from "./SidebarTabs.module.css";
import { usePathname } from "next/navigation";

const SidebarTabs = () => {
  const pathname = usePathname();

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
      <Link href="/chat" style={{ textDecoration: "none", color: "black" }}>
        <div className={`${styles.tabContainer} ${pathname.includes("/chat") ? styles.active : ""}`}>
          <p>My Chats</p>
        </div>
      </Link>
      <Link href="/library" style={{ textDecoration: "none", color: "black" }}>
        <div className={`${styles.tabContainer} ${pathname.includes("/library") ? styles.active : ""}`}>
          <p>Library</p>
        </div>
      </Link>
    </div>
  );
};

export default SidebarTabs;
