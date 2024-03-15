import { getServerSession } from "next-auth";
import React from "react";
import { NextResponse } from "next/server";
import { redirect } from "next/navigation";
import { authOptions } from "@/utils/authOptions";

const page = async () => {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/signin");
  }

  return (
    <div>
      <h1>Select The Group to start Chat</h1>
    </div>
  );
};

export default page;
