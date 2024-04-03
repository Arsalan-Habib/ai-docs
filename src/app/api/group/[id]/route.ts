import DocGroup from "@/schemas/DocGroup";
import Docs from "@/schemas/Docs";
import MessageHistory from "@/schemas/MessageHistory";
import { deleteFileFromAWS } from "@/utils";
import { authOptions } from "@/utils/authOptions";
import { Bucket, s3 } from "@/utils/constants";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);

    const group = await DocGroup.findOneAndDelete({ groupId: params.id, userId: session?.user?.id });

    if (!group) {
      return NextResponse.json({
        status: false,
        message: "Groups not found",
      });
    }

    const files = [...group.filenames, group.mergedFilename];

    await Promise.all([
      Docs.deleteMany({ groupId: group.groupId, userId: session?.user?.id }),
      MessageHistory.deleteMany({ sessionId: group.groupId }),
      ...files.map(async (file) => deleteFileFromAWS(file)),
    ]);

    return NextResponse.json({
      status: true,
      message: "Document group deleted successfully",
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

    const doc = await DocGroup.findOneAndUpdate(
      { groupId: params.id, userId: session?.user?.id },
      { groupName: body.name },
    );

    if (!doc) {
      return NextResponse.json({
        status: false,
        message: "Documents group not found",
      });
    }

    return NextResponse.json({
      status: true,
      message: "Documents group updated successfully",
    });
  } catch (error: any) {
    console.log("error", error);
    throw new Error(error);
  }
}
