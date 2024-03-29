import DocGroup, { IDocGroup } from "@/schemas/DocGroup";
import Folder from "@/schemas/Folder";
import { Bucket, s3 } from "@/utils/constants";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { Document } from "mongoose";
import { cache } from "react";

export const getFileUrls = cache(async (groupId: string) => {
  const docGroup = await DocGroup.findOne({ groupId });

  let fileUrls: string[] = [];

  if (docGroup) {
    for (const file of docGroup.filenames) {
      const command = new GetObjectCommand({ Bucket, Key: file });
      const src = await getSignedUrl(s3, command, { expiresIn: 3600 });
      fileUrls.push(src);
    }
  }

  return fileUrls;
});

export const getMergedFileUrl = cache(async (groupId: string) => {
  const docGroup = await DocGroup.findOne({ groupId });
  const command = new GetObjectCommand({ Bucket, Key: docGroup?.mergedFilename });
  const src = await getSignedUrl(s3, command, { expiresIn: 3600 });
  return src;
});

export const getGroups = cache(async ({ userId }: { userId: string }) => {
  const data: IDocGroup[] = await DocGroup.find({ userId: userId });

  let groupsWithFileUrls = [];

  for (const group of data) {
    const fileUrls = await getFileUrls(group.groupId);
    groupsWithFileUrls.push({ ...((group as unknown as Document).toJSON() as IDocGroup), fileUrls });
  }

  return groupsWithFileUrls;
});

export const getFolders = cache(async ({ userId }: { userId: string }) => {
  const folders = await Folder.find({ userId: userId });

  return folders;
});

export const getFolder = cache(async ({ userId, folderId }: { userId: string; folderId: string }) => {
  const folder = await Folder.findOne({ userId: userId, _id: folderId });
  return folder;
});
