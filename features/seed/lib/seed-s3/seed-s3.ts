import "server-only";

import { CreateBucketCommand } from "@aws-sdk/client-s3";
import { getS3Client } from "@/lib/aws/client-factory";
import type { S3Resource } from "@/features/seed/presets/schema";

const SKIP_ERROR_NAMES = new Set([
  "BucketAlreadyExists",
  "BucketAlreadyOwnedByYou",
]);

type SeedResult = { created: string[]; skipped: string[]; failed: string[] };

/**
 * Creates S3 buckets for the given preset S3 resources.
 * Per-bucket try/catch — one failure does not block others.
 * Already-existing buckets are recorded as skipped.
 */
export async function seedS3(buckets: S3Resource[]): Promise<SeedResult> {
  if (buckets.length === 0) return { created: [], skipped: [], failed: [] };

  const client = await getS3Client();
  const created: string[] = [];
  const skipped: string[] = [];
  const failed: string[] = [];

  await Promise.allSettled(
    buckets.map(async (bucket) => {
      try {
        await client.send(new CreateBucketCommand({ Bucket: bucket.name }));
        created.push(bucket.name);
      } catch (err) {
        const name = (err as { name?: string }).name ?? "";
        if (SKIP_ERROR_NAMES.has(name)) {
          skipped.push(bucket.name);
        } else {
          failed.push(bucket.name);
        }
      }
    }),
  );

  return { created, skipped, failed };
}
