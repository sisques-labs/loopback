import "server-only";

import {
  ListBucketsCommand,
  ListObjectsV2Command,
  type S3Client,
} from "@aws-sdk/client-s3";
import type { S3BucketSnapshot, S3ObjectMetadata } from "@/features/snapshots/lib/types/snapshot";

export async function captureS3(client: S3Client): Promise<S3BucketSnapshot[]> {
  const bucketsRes = await client.send(new ListBucketsCommand({}));
  const buckets = bucketsRes.Buckets ?? [];

  if (buckets.length === 0) return [];

  const snapshots: S3BucketSnapshot[] = [];

  for (const bucket of buckets) {
    const bucketName = bucket.Name!;
    const objects: S3ObjectMetadata[] = [];

    // Paginated listing of objects — metadata only, no GetObject calls
    let continuationToken: string | undefined;

    do {
      const res = await client.send(
        new ListObjectsV2Command({
          Bucket: bucketName,
          ContinuationToken: continuationToken,
        }),
      );

      for (const obj of res.Contents ?? []) {
        objects.push({
          key: obj.Key!,
          size: obj.Size ?? 0,
          etag: obj.ETag,
          lastModified: obj.LastModified?.toISOString() ?? new Date(0).toISOString(),
          // ContentType is NOT available from ListObjectsV2 — would require HeadObject
          contentType: undefined,
        });
      }

      continuationToken = res.IsTruncated ? res.NextContinuationToken : undefined;
    } while (continuationToken);

    snapshots.push({ bucketName, objects });
  }

  return snapshots;
}
