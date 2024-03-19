import { getServerSession } from "next-auth";
import React from "react";
import DocGroup, { IDocGroup } from "@/schemas/DocGroup";
import Sidebar from "@/components/Sidebar/Sidebar";
import { authOptions } from "@/utils/authOptions";

export const revalidate = 3600;

const ChatLayout = async ({ children }: { children: React.ReactNode }) => {
  const session = await getServerSession(authOptions);

  const data: IDocGroup[] = await DocGroup.find({ userId: session?.user?.id });

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <Sidebar groups={data} />

      {children}
    </div>
  );
};

export default ChatLayout;
