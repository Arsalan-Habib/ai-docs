import MessageHistory from "@/schemas/MessageHistory";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const chatmessages = await MessageHistory.findOne({ sessionId: params.id });

    if (!chatmessages) {
      return NextResponse.json({
        status: false,
        message: "Messages history not found",
        data: [],
      });
    }

    return NextResponse.json({
      status: true,
      message: "Messages history fetched successfully",
      data: chatmessages.messages,
    });
  } catch (error: any) {
    console.log(error);
    throw new Error(error);
  }
}
