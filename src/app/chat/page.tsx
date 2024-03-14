import { getServerSession } from "next-auth";
import React from "react";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { NextResponse } from "next/server";
import { redirect } from "next/navigation";

const page = async (req: Request) => {
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
