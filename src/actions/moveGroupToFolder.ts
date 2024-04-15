"use server";

import DocGroup from "@/schemas/DocGroup";
import { revalidatePath } from "next/cache";

export const moveGroupToFolder = async (groupId: string, folderId: string) => {
  const docGroup = await DocGroup.findOneAndUpdate({ groupId }, { folderId });
  //   console.log({ groupId, folderId });

  if (!docGroup) {
    throw new Error("Group not found");
  }

  revalidatePath("/library");

  return {
    status: true,
    message: "Group moved to folder successfully",
  };
};
