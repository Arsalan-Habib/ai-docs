import { getFileUrls, getMergedFileUrl } from "@/app/utils";
import ChatLayout from "@/components/ChatLayout/ChatLayout";
import dbConnect from "@/lib/mongodb";

const Chat = async ({ params }: { params: { id: string } }) => {
  await dbConnect();

  const fileUrl = await getMergedFileUrl(params.id);

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
      <ChatLayout fileUrl={fileUrl} params={params} />
    </div>
  );
};

export default Chat;
