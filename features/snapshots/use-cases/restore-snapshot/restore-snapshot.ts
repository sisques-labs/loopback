"use server";

import "server-only";

import { revalidatePath } from "next/cache";
import { getDynamoDBClient, getDynamoDBDocumentClient } from "@/features/dynamodb/lib/client";
import { getSQSClient } from "@/features/sqs/lib/client";
import { getS3Client } from "@/lib/aws/client-factory";
import { restoreDynamoDB } from "@/features/snapshots/services/restore-dynamodb/restore-dynamodb";
import { restoreSQS } from "@/features/snapshots/services/restore-sqs/restore-sqs";
import { restoreS3 } from "@/features/snapshots/services/restore-s3/restore-s3";
import { snapshotDocumentSchema } from "@/features/snapshots/lib/schema/snapshot-schema";
import type { ActionState } from "@/features/shared/types/action-state";
import type { RestoreReport } from "@/features/snapshots/lib/types/snapshot";

export async function restoreSnapshotAction(
  _prev: ActionState<RestoreReport>,
  formData: FormData,
): Promise<ActionState<RestoreReport>> {
  const raw = formData.get("snapshot");
  if (!raw || typeof raw !== "string") {
    return { status: "error", message: "No snapshot provided." };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { status: "error", message: "Invalid JSON in snapshot field." };
  }

  const parseResult = snapshotDocumentSchema.safeParse(parsed);
  if (!parseResult.success) {
    return {
      status: "error",
      message: `Invalid snapshot format: ${parseResult.error.issues[0]?.message ?? "unknown"}`,
    };
  }

  const doc = parseResult.data;

  const [dynClient, docClient, sqsClient, s3Client] = await Promise.all([
    getDynamoDBClient(),
    getDynamoDBDocumentClient(),
    getSQSClient(),
    getS3Client(),
  ]);

  // Sequential: DDB → SQS → S3
  const ddbReport = await restoreDynamoDB(dynClient, docClient, doc.dynamodb);
  const sqsReport = await restoreSQS(sqsClient, doc.sqs);
  const s3Report = await restoreS3(s3Client, doc.s3);

  revalidatePath("/", "layout");

  return {
    status: "success",
    data: { services: [ddbReport, sqsReport, s3Report] },
  };
}
