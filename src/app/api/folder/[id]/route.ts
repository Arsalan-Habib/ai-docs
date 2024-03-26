import Folder from "@/schemas/Folder";
import { authOptions } from "@/utils/authOptions";
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
