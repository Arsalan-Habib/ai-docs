import Button from "@/components/Button/Button";
import Header from "@/components/Header/Header";
import dbConnect from "@/lib/mongodb";
import { authOptions } from "@/utils/authOptions";
import { getServerSession } from "next-auth";
import Image from "next/image";
import Link from "next/link";
import styles from "./page.module.css";

export default async function Home() {
  await dbConnect();
  const session = await getServerSession(authOptions);

  const href = session ? "/library" : "/signin";

  return (
    <div>
      <Header />

      <main className={styles.main}>
        <Image src={"/bgbubble.png"} alt="" width={750} height={450} className={styles.bgBubble} />
        <h1 className={styles.mainHeading}>The AI Docs Companion you always wanted.</h1>

        <p className={styles.description}>
          Say hello to documents that respond to you! <br /> With AI Docs, your reading isn&apos;t just simple,
          it&apos;s fun!
        </p>
        <div className={styles.btnsContainer}>
          <Link href={href} passHref>
            <Button variant="contained">{!session ? "Sign In" : "Get Started"}</Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
