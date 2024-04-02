"use server";

import dbConnect from "@/lib/mongodb";
import Folder from "@/schemas/Folder";
import { authOptions } from "@/utils/authOptions";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";

export async function addFolder(prevState: any, formdata: FormData) {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);

    if (!session) {
      return {
        status: false,
        message: "Please sign in to add folder",
      };
    }

    const name = formdata.get("name");
    const folder = await Folder.findOne({ name: name, userId: session.user?.id });
    if (folder) {
      return {
        status: false,
        message: "Folder already exist",
      };
    }
    await Folder.create({
      userId: session?.user?.id,
      name: name,
    });

    console.log("name", name);

    revalidatePath("/library");

    return {
      status: true,
      message: "Folder added successfully",
    };
  } catch (error: any) {
    console.log(error);
    throw new Error(error);
  }
}
