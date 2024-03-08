import Visit from "@/icons/Visit";
import Link from "next/link";
import styles from "./page.module.css";
import Button from "@/components/Button/Button";
import Chip from "@/components/Chip/Chip";
import Image from "next/image";

export default async function Home() {
  return (
    <main className={styles.main}>
      <Image
        src={"/bgbubble.png"}
        alt=""
        width={750}
        height={450}
        className={styles.bgBubble}
      />
      <h1 className={styles.mainHeading}>
        The AI Docs Companion you always wanted.
      </h1>

      <p className={styles.description}>
        Say hello to documents that respond to you! <br /> With AI Docs, your
        reading isn&apos;t just simple, it&apos;s fun!
      </p>
      <div className={styles.btnsContainer}>
        <Link href="#">
          <Button variant="outlined">
            <span>AI Docs</span>
            <Visit />
          </Button>
        </Link>
        <Link href="/signup" passHref>
          <Button variant="contained">Get Started</Button>
        </Link>
      </div>
      <div className={styles.formatContainer}>
        <h3 className={styles.formatHeading}>Supported formats</h3>
        <div className={styles.chips}>
          <Chip label="PDF" />
          <Chip label="TXT" />
          <Chip label="PPT" />
          <Chip label="EPUB" />
          <Chip label="DOC" />
        </div>
      </div>
    </main>
  );
}

// async function uploadFiles(e: React.FormEvent<HTMLFormElement>) {
//   e.preventDefault();
//   const formData = new FormData(e.currentTarget);

//   const file = formData.get("file");

//   console.log(URL.createObjectURL(file as Blob));

//   const res = await fetch("/api/uploadFiles", {
//     method: "POST",
//     body: formData,
//   });

//   const result = await res.json();
//   console.log(result);
// }
