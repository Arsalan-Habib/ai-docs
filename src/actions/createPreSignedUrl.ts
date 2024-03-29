"use server";

import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const REGION = process.env.AWS_REGION;
const BUCKET = process.env.AWS_BUCKET_NAME;

export async function createPresignedUrl({ key }: { key: string }) {
  const client = new S3Client({ region: REGION });
  const command = new PutObjectCommand({ Bucket: BUCKET, Key: key });
  return getSignedUrl(client, command, { expiresIn: 3600 });
}
