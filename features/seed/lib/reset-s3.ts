import "server-only";

import {
  ListBucketsCommand,
  ListObjectsV2Command,
  DeleteObjectsCommand,
  DeleteBucketCommand,
} from "@aws-sdk/client-s3";
import { getS3Client } from "@/lib/aws/client-factory";

type DeleteResult = { deleted: string[]; failed: string[] };

/**
 * Dry-run overload: returns total bucket count without deleting anything.
 */
export async function resetS3(opts: { dryRun: true }): Promise<number>;
/**
 * Execute overload: empties and deletes all buckets, returns per-bucket results.
 */
export async function resetS3(opts?: { dryRun: false } | undefined): Promise<DeleteResult>;
export async function resetS3(
  opts?: { dryRun: boolean },
): Promise<number | DeleteResult> {
  const dryRun = opts?.dryRun ?? false;
  const client = await getS3Client();

  const listRes = await client.send(new ListBucketsCommand({}));
  const buckets = listRes.Buckets ?? [];

  if (dryRun) {
    return buckets.length;
  }

  const deleted: string[] = [];
  const failed: string[] = [];

  await Promise.allSettled(
    buckets.map(async (bucket) => {
      const name = bucket.Name ?? "";
      try {
        // Paginate ListObjectsV2 → DeleteObjects (batches of 1000)
        let continuationToken: string | undefined = undefined;
        do {
          const listObjRes = await client.send(
            new ListObjectsV2Command({
              Bucket: name,
              ...(continuationToken ? { ContinuationToken: continuationToken } : {}),
            }),
          );

          const keys = listObjRes.Contents ?? [];
          if (keys.length > 0) {
            await client.send(
              new DeleteObjectsCommand({
                Bucket: name,
                Delete: {
                  Objects: keys.map((obj) => ({ Key: obj.Key! })),
                  Quiet: true,
                },
              }),
            );
          }

          continuationToken = listObjRes.IsTruncated
            ? listObjRes.NextContinuationToken
            : undefined;
        } while (continuationToken);

        // All objects removed — now delete the bucket
        await client.send(new DeleteBucketCommand({ Bucket: name }));
        deleted.push(name);
      } catch {
        failed.push(name);
      }
    }),
  );

  return { deleted, failed };
}
