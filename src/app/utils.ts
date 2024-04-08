import DocGroup, { IDocGroup } from "@/schemas/DocGroup";
import Folder from "@/schemas/Folder";
import MessageHistory from "@/schemas/MessageHistory";
import { getTruncatedTime } from "@/utils";
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
      const command = new GetObjectCommand({ Bucket, Key: file, ResponseCacheControl: "max-age=21600, public" });

      const src = await getSignedUrl(s3, command, { expiresIn: 7 * 3600, signingDate: getTruncatedTime() });

      fileUrls.push(src);
    }
  }

  return fileUrls;
});

export const getMergedFileUrl = cache(async (groupId: string) => {
  const docGroup = await DocGroup.findOne({ groupId });
  const command = new GetObjectCommand({
    Bucket,
    Key: docGroup?.mergedFilename,
    ResponseCacheControl: "max-age=21600, public",
  });

  const src = await getSignedUrl(s3, command, { expiresIn: 7 * 3600, signingDate: getTruncatedTime() });

  return src;
});

export const getGroups = cache(async ({ userId }: { userId: string }) => {
  const data: IDocGroup[] = await DocGroup.find({ userId: userId })
    .collation({ locale: "en", strength: 2 })
    .sort({ groupName: -1 });

  let groupsWithFileUrls = [];

  for (const group of data) {
    const fileUrls = await getFileUrls(group.groupId);
    groupsWithFileUrls.push({ ...((group as unknown as Document).toJSON() as IDocGroup), fileUrls });
  }

  return groupsWithFileUrls;
});

export const getGroupsWithChatHistory = cache(async ({ userId }: { userId: string }) => {
  const data = await getGroups({ userId });

  const groupIds = data.map((item) => item.groupId);

  const messageHistories = await MessageHistory.find({ sessionId: { $in: groupIds }, "messages.1": { $exists: true } });

  const groupWithHistory = data.filter((item) =>
    messageHistories.some((history) => history.sessionId === item.groupId),
  );

  return groupWithHistory;
});

export const getFolders = cache(async ({ userId }: { userId: string }) => {
  const folders = await Folder.find({ userId: userId }).collation({ locale: "en", strength: 2 }).sort({ name: -1 });

  return folders;
});

export const getFolder = cache(async ({ userId, folderId }: { userId: string; folderId: string }) => {
  const folder = await Folder.findOne({ userId: userId, _id: folderId });
  return folder;
});
