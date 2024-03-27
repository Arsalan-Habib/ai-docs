import { getFolders, getGroups } from "@/app/utils";
import AddNew from "@/components/AddNew/AddNew";
import GroupThumbnail from "@/components/GroupThumbnail/GroupThumbnail";
import FolderIcon from "@/icons/FolderIcon";
import { authOptions } from "@/utils/authOptions";
import { getServerSession } from "next-auth";
import Link from "next/link";
import styles from "./library.module.css";

export const revalidate = false;

const Library = async () => {
  const session = await getServerSession(authOptions);

  const groupsData = getGroups({ userId: session?.user?.id as string });
  const foldersData = getFolders({ userId: session?.user?.id as string });

  const [groups, folders] = await Promise.all([groupsData, foldersData]);

  const groupsWithNoFolder = groups.filter((group) => group.folderId === "undefined");

  return (
    <div className={styles.root}>
      <div className={styles.mainContainer}>
        <div style={{ marginTop: "1.5rem", display: "flex", gap: "2rem", flexWrap: "wrap" }}>
          <>
            {folders.length > 0 &&
              folders.map((folder, i) => {
                return (
                  <Link key={i} href={`/library/${folder._id}`} style={{ textDecoration: "none", color: "black" }}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                      <div className={`${styles.groupContainer} ${styles.folder}`}>
                        <FolderIcon />
                      </div>
                      <h3>{folder.name}</h3>
                    </div>
                  </Link>
                );
              })}
          </>
          <>
            {groupsWithNoFolder.length > 0 &&
              groupsWithNoFolder.map((group, i) => {
                return <GroupThumbnail group={group} key={i} />;
              })}
          </>

          <AddNew />
        </div>
      </div>
    </div>
  );
};

export default Library;
