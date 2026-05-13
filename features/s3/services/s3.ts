import "server-only";

import {
  HeadObjectCommand,
  ListBucketsCommand,
  ListObjectsV2Command,
} from "@aws-sdk/client-s3";
import type { Bucket, S3Object } from "@/types/aws";
import { getS3Client } from "@/lib/aws/client-factory";
import { toFriendlyError } from "@/lib/aws/errors";

export async function listBuckets(): Promise<Bucket[]> {
  try {
    const client = getS3Client();
    const { Buckets } = await client.send(new ListBucketsCommand({}));
    if (!Buckets) return [];
    return Buckets.map((b) => ({
      name: b.Name ?? "",
      createdAt: b.CreationDate?.toISOString() ?? new Date(0).toISOString(),
    }));
  } catch (err) {
    const { code, message } = toFriendlyError(err);
    throw Object.assign(new Error(message), { name: code });
  }
}

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
    };
  } catch (err) {
    const friendly = toFriendlyError(err);
    if (friendly.code === "NoSuchKey") return null;
    throw Object.assign(new Error(friendly.message), { name: friendly.code });
  }
}
