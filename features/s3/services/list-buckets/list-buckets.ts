import "server-only";

import { ListBucketsCommand } from "@aws-sdk/client-s3";
import type { Bucket } from "@/features/s3/types/s3";
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
