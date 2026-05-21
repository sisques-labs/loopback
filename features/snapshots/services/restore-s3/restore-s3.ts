import "server-only";

import {
  CreateBucketCommand,
  type S3Client,
} from "@aws-sdk/client-s3";
import type {
  S3BucketSnapshot,
  RestoreServiceReport,
  RestoreResourceResult,
} from "@/features/snapshots/lib/types/snapshot";

export async function restoreS3(
  client: S3Client,
  buckets: S3BucketSnapshot[],
): Promise<RestoreServiceReport> {
  const resources: RestoreResourceResult[] = [];

  for (const bucket of buckets) {
    try {
      await client.send(
        new CreateBucketCommand({ Bucket: bucket.bucketName }),
      );
      resources.push({ name: bucket.bucketName, status: "created" });
    } catch (err) {
      if (err instanceof Error && err.name === "BucketAlreadyOwnedByYou") {
        resources.push({ name: bucket.bucketName, status: "skipped" });
      } else {
        resources.push({ name: bucket.bucketName, status: "failed", error: String(err) });
      }
    }
  }

  return { service: "s3", resources };
}
