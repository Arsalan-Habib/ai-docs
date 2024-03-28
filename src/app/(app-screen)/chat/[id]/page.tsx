import { getFileUrls, getGroups, getMergedFileUrl } from "@/app/utils";
import ChatLayout from "@/components/ChatLayout/ChatLayout";
import dbConnect from "@/lib/mongodb";
import { authOptions } from "@/utils/authOptions";
import { getServerSession } from "next-auth";

const Chat = async ({ params }: { params: { id: string } }) => {
  await dbConnect();
  const session = await getServerSession(authOptions);

  const fileUrl = await getMergedFileUrl(params.id);

  const groups = await getGroups({ userId: session?.user?.id as string });

  const group = groups.find((group) => group.groupId === params.id);

  return (
    <div
      style={{
        width: "100%",
        height: "100vh",
        padding: "2rem 2rem",
        display: "flex",
        justifyContent: "space-between",
        // gridTemplateColumns: "1fr 1fr",
      }}
    >
      <ChatLayout fileUrl={fileUrl} params={params} groupTitle={group?.groupName as string} />
    </div>
  );
};

export default Chat;
