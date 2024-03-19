import DocGroup from "@/schemas/DocGroup";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { Bucket, s3 } from "@/utils/constants";
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
