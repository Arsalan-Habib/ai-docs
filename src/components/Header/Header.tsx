import React from "react";
import styles from "./Header.module.css";
import Instagram from "@/icons/Instagram";
import Twitter from "@/icons/Twitter";
import Link from "next/link";

const Header = () => {
  return (
    <div className={styles.root}>
      <Link href="/" style={{ textDecoration: "none", color: "black" }}>
        <h1>AI Docs.</h1>
      </Link>
      <div className={styles.icons}>
        <Link href={"#"}>
          <Instagram />
        </Link>
        <Link href="#">
          <Twitter />
        </Link>
      </div>
    </div>
  );
};

export default Header;
