import "server-only";

import { HeadObjectCommand } from "@aws-sdk/client-s3";
import type { S3Object } from "@/features/s3/types/s3";
import { getS3Client } from "@/lib/aws/client-factory";
import { toFriendlyError } from "@/lib/aws/errors";

export async function headObject(bucket: string, key: string): Promise<S3Object | null> {
  try {
    const client = getS3Client();
    const res = await client.send(new HeadObjectCommand({ Bucket: bucket, Key: key }));
    return {
      key,
      size: res.ContentLength ?? 0,
      lastModified: res.LastModified?.toISOString() ?? new Date(0).toISOString(),
      etag: res.ETag,
      storageClass: res.StorageClass,
      contentType: res.ContentType,
    };
  } catch (err) {
    const friendly = toFriendlyError(err);
    if (friendly.code === "NoSuchKey") return null;
    throw Object.assign(new Error(friendly.message), { name: friendly.code });
  }
}
