import { authOptions } from "@/utils/authOptions";
import { getServerSession } from "next-auth";
import React from "react";
import { getGroups } from "../utils";
import PDFWorker from "@/components/PDFWorker/PDFWorker";
import Sidebar from "@/components/Sidebar/Sidebar";

const ChatLayout = async ({ children }: { children: React.ReactNode }) => {
  const session = await getServerSession(authOptions);

  const data = await getGroups({ userId: session?.user?.id as string });

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <PDFWorker />
      <Sidebar groups={data} />

      {children}
    </div>
  );
};

export default ChatLayout;
