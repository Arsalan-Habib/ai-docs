import { getServerSession } from "next-auth";
import React from "react";
import { authOptions } from "../api/auth/[...nextauth]/route";
import DocGroup from "@/schemas/DocGroup";
import Sidebar from "@/components/Sidebar/Sidebar";

const ChatLayout = async ({ children }: { children: React.ReactNode }) => {
  const session = await getServerSession(authOptions);

  const data = await DocGroup.find({ userId: session?.user?.id });

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <Sidebar groups={data} />

      {children}
    </div>
  );
};

export default ChatLayout;
