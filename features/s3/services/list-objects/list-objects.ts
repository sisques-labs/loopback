import "server-only";

import { ListObjectsV2Command } from "@aws-sdk/client-s3";
import type { S3Object } from "@/types/aws";
import { getS3Client } from "@/lib/aws/client-factory";
import { toFriendlyError } from "@/lib/aws/errors";

export async function listObjects(bucket: string, prefix?: string): Promise<S3Object[]> {
  try {
    const client = getS3Client();
    const { Contents } = await client.send(
      new ListObjectsV2Command({ Bucket: bucket, Prefix: prefix }),
    );
    if (!Contents) return [];
    return Contents.map((o) => ({
      key: o.Key ?? "",
      size: o.Size ?? 0,
      lastModified: o.LastModified?.toISOString() ?? new Date(0).toISOString(),
      etag: o.ETag,
      storageClass: o.StorageClass,
    }));
  } catch (err) {
    const { code, message } = toFriendlyError(err);
    throw Object.assign(new Error(message), { name: code });
  }
}
