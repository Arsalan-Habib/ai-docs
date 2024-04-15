import { getFolders, getGroups } from "@/app/utils";
import AddDocuments from "@/components/AddDocuments/AddDocuments";
import GroupThumbnail from "@/components/GroupThumbnail/GroupThumbnail";
import { authOptions } from "@/utils/authOptions";
import { getServerSession } from "next-auth";
import styles from "./styles.module.css";

const Folder = async ({
  params,
  searchParams,
}: {
  params: { folderId: string };
  searchParams?: { query?: string };
}) => {
  const session = await getServerSession(authOptions);

  const groupsData = getGroups({ userId: session?.user?.id as string });
  const foldersData = getFolders({ userId: session?.user?.id as string });

  const [groups, folders] = await Promise.all([groupsData, foldersData]);

  const folderGroups = groups
    .filter((group) => group.folderId === params.folderId)
    .filter((group) => group.groupName?.toLowerCase().includes(searchParams?.query?.toLowerCase() || ""));

  return (
    <div className={styles.root}>
      {folderGroups.length > 0 &&
        folderGroups.map((group, i) => {
          return <GroupThumbnail group={group} key={i} folders={folders} />;
        })}
      <AddDocuments />
    </div>
  );
};

export default Folder;
