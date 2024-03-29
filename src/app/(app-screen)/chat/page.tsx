import { getServerSession } from "next-auth";
import React from "react";
import { redirect } from "next/navigation";
import { authOptions } from "@/utils/authOptions";
import styles from "./chat.module.css";
import Button from "@/components/Button/Button";
import Link from "next/link";

const page = async () => {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/signin");
  }

  return (
    <div className={styles.root}>
      <h1 className={styles.title}>
        Select a group from <b>library</b> <br /> to start chat
      </h1>
      <Link href="/library" style={{ textDecoration: "none" }}>
        <Button variant="contained">Go to library</Button>
      </Link>
    </div>
  );
};

export default page;
