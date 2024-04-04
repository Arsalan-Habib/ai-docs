import { authOptions } from "@/utils/authOptions";
import { getServerSession } from "next-auth";
import React from "react";
import { getGroups, getGroupsWithChatHistory } from "../utils";
import PDFWorker from "@/components/PDFWorker/PDFWorker";
import Sidebar from "@/components/Sidebar/Sidebar";

const ChatLayout = async ({ children }: { children: React.ReactNode }) => {
  const session = await getServerSession(authOptions);

  const data = await getGroups({ userId: session?.user?.id as string });

  const groupWithHistory = await getGroupsWithChatHistory({ userId: session?.user?.id as string });

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <PDFWorker />
      <Sidebar groups={data} groupsWithHistory={groupWithHistory} />

      {children}
    </div>
  );
};

export default ChatLayout;
