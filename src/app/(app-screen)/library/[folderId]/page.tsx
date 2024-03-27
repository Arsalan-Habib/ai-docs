import { getGroups } from "@/app/utils";
import AddDocuments from "@/components/AddDocuments/AddDocuments";
import GroupThumbnail from "@/components/GroupThumbnail/GroupThumbnail";
import { authOptions } from "@/utils/authOptions";
import { getServerSession } from "next-auth";
import styles from "./styles.module.css";

const Folder = async ({ params }: { params: { folderId: string } }) => {
  const session = await getServerSession(authOptions);

  const groups = await getGroups({ userId: session?.user?.id as string });

  const folderGroups = groups.filter((group) => group.folderId === params.folderId);

  return (
    <div className={styles.root}>
      {folderGroups.length > 0 &&
        folderGroups.map((group, i) => {
          return <GroupThumbnail group={group} key={i} />;
        })}
      <AddDocuments />
    </div>
  );
};

export default Folder;
