"use server";

import "server-only";
import { revalidatePath } from "next/cache";
import { PRESETS, isPresetSlug } from "@/features/seed/presets";
import { seedS3 } from "@/features/seed/lib/seed-s3/seed-s3";
import { seedSQS } from "@/features/seed/lib/seed-sqs/seed-sqs";
import { seedDynamoDB } from "@/features/seed/lib/seed-dynamodb/seed-dynamodb";
import { seedLambda } from "@/features/seed/lib/seed-lambda/seed-lambda";
import { seedSNS } from "@/features/seed/lib/seed-sns/seed-sns";
import type { ActionState } from "@/features/shared/types/action-state";
import type { LoadReport, ServiceKey, ServiceResult } from "@/features/seed/types";

const IDLE: ActionState<LoadReport> = { status: "idle" };
void IDLE;

/**
 * Loads all resources from a chosen preset into LocalStack.
 *
 * Fan-out via Promise.allSettled — a single service failure does NOT block
 * other services. The action always returns success (possibly partial) unless
 * the preset slug is invalid.
 */
export async function loadDemoDatasetAction(
  _prev: ActionState<LoadReport>,
  formData: FormData,
): Promise<ActionState<LoadReport>> {
  const presetRaw = formData.get("preset");

  if (!isPresetSlug(presetRaw)) {
    return {
      status: "error",
      message: `Invalid preset: "${String(presetRaw)}". Must be one of: ecommerce, blog, event-driven.`,
    };
  }

  const preset = PRESETS[presetRaw];

  // Fan-out: each seeder handles its own errors internally.
  // Promise.allSettled here guards against any unexpected seeder-level throws.
  const [s3Result, sqsResult, dynamoResult, lambdaResult, snsResult] =
    await Promise.allSettled([
      seedS3(preset.s3),
      seedSQS(preset.sqs),
      seedDynamoDB(preset.dynamodb),
      seedLambda(preset.lambda),
      seedSNS(preset.sns),
    ]);

  function toServiceResult(
    service: ServiceKey,
    settled: PromiseSettledResult<{ created: string[]; skipped: string[]; failed: string[] }>,
  ): ServiceResult {
    if (settled.status === "fulfilled") {
      return {
        service,
        created: settled.value.created.length,
        skipped: settled.value.skipped.length,
        failed: settled.value.failed.length,
        errors: settled.value.failed,
      };
    }
    // Seeder itself threw — treat all resources as failed
    return {
      service,
      created: 0,
      skipped: 0,
      failed: 1,
      errors: [String((settled.reason as Error).message ?? settled.reason)],
    };
  }

  const results: ServiceResult[] = [
    toServiceResult("s3", s3Result),
    toServiceResult("sqs", sqsResult),
    toServiceResult("dynamodb", dynamoResult),
    toServiceResult("lambda", lambdaResult),
    toServiceResult("sns", snsResult),
  ];

  revalidatePath("/", "layout");

  return { status: "success", data: { results } };
}
