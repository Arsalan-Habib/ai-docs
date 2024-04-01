import DocGroup from "@/schemas/DocGroup";
import Docs from "@/schemas/Docs";
import Folder from "@/schemas/Folder";
import { authOptions } from "@/utils/authOptions";
import { Query } from "mongoose";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);

    const folder = await Folder.findOne({ _id: params.id, userId: session?.user?.id });

    if (!folder) {
      return NextResponse.json({
        status: false,
        message: "Folder not found",
      });
    }

    return NextResponse.json({
      status: true,
      message: "Folder fetched successfully",
      data: folder,
    });
  } catch (error: any) {
    console.log("error", error);
    throw new Error(error);
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);

    const folder = await Folder.findOneAndDelete({ _id: params.id, userId: session?.user?.id });

    if (!folder) {
      return NextResponse.json({
        status: false,
        message: "Folder not found",
      });
    }

    const groupsInFolder = await DocGroup.find({ folderId: params.id, userId: session?.user?.id });

    if (!groupsInFolder) {
      return NextResponse.json({
        status: false,
        message: "Groups not found",
      });
    }

    await DocGroup.deleteMany({ folderId: params.id, userId: session?.user?.id });

    const groupIds = groupsInFolder.map((group: any) => group.groupId);
    console.log("groupIds", groupIds);

    await Docs.deleteMany({ groupId: { $in: groupIds }, userId: session?.user?.id });

    return NextResponse.json({
      status: true,
      message: "Folder deleted successfully",
    });
  } catch (error: any) {
    console.log("error", error);
    throw new Error(error);
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    const body = await req.json();

    const folder = await Folder.findOneAndUpdate({ _id: params.id, userId: session?.user?.id }, { name: body.name });

    if (!folder) {
      return NextResponse.json({
        status: false,
        message: "Folder not found",
      });
    }

    return NextResponse.json({
      status: true,
      message: "Folder updated successfully",
    });
  } catch (error: any) {
    console.log("error", error);
    throw new Error(error);
  }
}
