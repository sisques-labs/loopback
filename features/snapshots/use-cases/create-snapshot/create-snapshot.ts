"use server";

import "server-only";

import { revalidatePath } from "next/cache";
import { getDynamoDBClient } from "@/features/dynamodb/lib/client";
import { getSQSClient } from "@/features/sqs/lib/client";
import { getS3Client } from "@/lib/aws/client-factory";
import { captureDynamoDB } from "@/features/snapshots/services/capture-dynamodb/capture-dynamodb";
import { captureSQS } from "@/features/snapshots/services/capture-sqs/capture-sqs";
import { captureS3 } from "@/features/snapshots/services/capture-s3/capture-s3";
import type { ActionState } from "@/features/shared/types/action-state";
import type { SnapshotDocument } from "@/features/snapshots/lib/types/snapshot";
import { createAwsConfig } from "@/lib/aws/config";

export async function createSnapshotAction(
  _prev: ActionState<SnapshotDocument>,
  _formData: FormData,
): Promise<ActionState<SnapshotDocument>> {
  const [dynClient, sqsClient, s3Client] = await Promise.all([
    getDynamoDBClient(),
    getSQSClient(),
    getS3Client(),
  ]);

  const [dynamoResult, sqsResult, s3Result] = await Promise.allSettled([
    captureDynamoDB(dynClient),
    captureSQS(sqsClient),
    captureS3(s3Client),
  ]);

  // All three failed — nothing to snapshot
  if (
    dynamoResult.status === "rejected" &&
    sqsResult.status === "rejected" &&
    s3Result.status === "rejected"
  ) {
    return {
      status: "error",
      message: "All capture services failed. Check LocalStack connectivity.",
    };
  }

  const dynamoTables =
    dynamoResult.status === "fulfilled" ? dynamoResult.value.tables : [];
  const sqsQueues = sqsResult.status === "fulfilled" ? sqsResult.value : [];
  const s3Buckets = s3Result.status === "fulfilled" ? s3Result.value : [];

  // Resolve endpoint from config for informational purposes
  let endpoint = "unknown";
  try {
    const config = await createAwsConfig();
    endpoint = config.endpoint ?? "default";
  } catch {
    // non-critical
  }

  const doc: SnapshotDocument = {
    version: "1",
    createdAt: new Date().toISOString(),
    endpoint,
    dynamodb: dynamoTables,
    sqs: sqsQueues,
    s3: s3Buckets,
  };

  revalidatePath("/snapshots");

  return { status: "success", data: doc };
}
