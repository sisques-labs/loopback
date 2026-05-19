"use server";

import { listBuckets } from "@/features/s3/services/list-buckets/list-buckets";
import type { Bucket } from "@/features/s3/types/s3";

export async function listBucketsAction(): Promise<Bucket[]> {
  return listBuckets();
}
