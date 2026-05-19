"use server";

import { listBuckets } from "@/features/s3/services/list-buckets/list-buckets";
import { listQueues } from "@/features/sqs/services/list-queues/list-queues";
import { listFunctions } from "@/features/lambda/services/list-functions/list-functions";
import { listTopics } from "@/features/sns/services/list-topics/list-topics";
import { listTables } from "@/features/dynamodb/services/list-tables/list-tables";
import { encodeQueueUrlForRoute } from "@/features/sqs/lib/encode-queue-url-param";
import { encodeFunctionNameForRoute } from "@/features/lambda/lib/route-codec";
import type { ResourceItem } from "@/features/shared/types/resource-item";

/**
 * Aggregates resources from all 5 list services and returns normalized ResourceItem[].
 *
 * Strategy: fetch-once-on-open + client-side filter.
 * - Called once when the CommandPalette opens (with no query argument).
 * - Returns ALL resources from all 5 services (no server-side filtering).
 * - The caller filters the cached snapshot client-side.
 * - Uses Promise.allSettled: a single failing service does NOT prevent results from others.
 *
 * @param localePrefix - e.g. "/en" or "/es"
 */
export async function searchResourcesAction(
  localePrefix: string,
): Promise<ResourceItem[]> {
  // Fetch all 5 services in parallel; partial failures are tolerated
  const [s3Result, sqsResult, lambdaResult, snsResult, dynamoResult] =
    await Promise.allSettled([
      listBuckets(),
      listQueues(),
      listFunctions(),
      listTopics(),
      listTables(),
    ]);

  const items: ResourceItem[] = [];

  // S3 buckets
  if (s3Result.status === "fulfilled") {
    for (const bucket of s3Result.value) {
      items.push({
        id: `s3-${bucket.name}`,
        label: bucket.name,
        kind: "s3",
        href: `${localePrefix}/s3/${bucket.name}`,
      });
    }
  }

  // SQS queues
  if (sqsResult.status === "fulfilled") {
    for (const queue of sqsResult.value) {
      items.push({
        id: `sqs-${queue.queueUrl}`,
        label: queue.name,
        kind: "sqs",
        href: `${localePrefix}/sqs/${encodeQueueUrlForRoute(queue.queueUrl)}`,
      });
    }
  }

  // Lambda functions
  if (lambdaResult.status === "fulfilled") {
    for (const fn of lambdaResult.value) {
      items.push({
        id: `lambda-${fn.functionName}`,
        label: fn.functionName,
        kind: "lambda",
        href: `${localePrefix}/lambda/${encodeFunctionNameForRoute(fn.functionName)}`,
      });
    }
  }

  // SNS topics
  if (snsResult.status === "fulfilled") {
    for (const topic of snsResult.value) {
      items.push({
        id: `sns-${topic.arn}`,
        label: topic.name,
        kind: "sns",
        href: `${localePrefix}/sns/${encodeURIComponent(topic.arn)}`,
      });
    }
  }

  // DynamoDB tables
  if (dynamoResult.status === "fulfilled") {
    for (const table of dynamoResult.value) {
      items.push({
        id: `dynamodb-${table.name}`,
        label: table.name,
        kind: "dynamodb",
        href: `${localePrefix}/dynamodb/${encodeURIComponent(table.name)}`,
      });
    }
  }

  return items;
}
