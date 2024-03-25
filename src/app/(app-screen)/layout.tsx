import { getServerSession } from "next-auth";
import React from "react";
import DocGroup, { IDocGroup } from "@/schemas/DocGroup";
import Sidebar from "@/components/Sidebar/Sidebar";
import { authOptions } from "@/utils/authOptions";
import PDFWorker from "@/components/PDFWorker/PDFWorker";
import { getGroups } from "../utils";

export const revalidate = 3600;

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
