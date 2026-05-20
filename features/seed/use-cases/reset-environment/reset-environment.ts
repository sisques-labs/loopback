"use server";

import "server-only";
import { revalidatePath } from "next/cache";
import { resetS3 } from "@/features/seed/lib/reset-s3";
import { resetSQS } from "@/features/seed/lib/reset-sqs";
import { resetDynamoDB } from "@/features/seed/lib/reset-dynamodb";
import { resetLambda } from "@/features/seed/lib/reset-lambda";
import { resetSNS } from "@/features/seed/lib/reset-sns";
import type { ActionState } from "@/features/shared/types/action-state";
import type { ResetReport, ServiceKey, ServiceResult } from "@/features/seed/types";

const IDLE: ActionState<ResetReport> = { status: "idle" };
void IDLE;

/**
 * Resets (or previews the reset of) all local environment resources.
 *
 * When `dryRun=true`:  calls per-service list helpers, returns resource counts
 *                      with no deletions performed.
 * When `dryRun=false`: calls per-service delete helpers via Promise.allSettled
 *                      (partial failures are tolerated) and revalidates cache.
 *
 * CloudWatch Logs: OUT OF SCOPE — intentionally excluded.
 */
export async function resetEnvironmentAction(
  _prev: ActionState<ResetReport>,
  formData: FormData,
): Promise<ActionState<ResetReport>> {
  const dryRun = formData.get("dryRun") === "true";

  if (dryRun) {
    // Dry-run: collect counts per service via Promise.allSettled
    const [s3, sqs, dynamo, lambda, sns] = await Promise.allSettled([
      resetS3({ dryRun: true }),
      resetSQS({ dryRun: true }),
      resetDynamoDB({ dryRun: true }),
      resetLambda({ dryRun: true }),
      resetSNS({ dryRun: true }),
    ]);

    function toCountResult(service: ServiceKey, settled: PromiseSettledResult<number>): ServiceResult {
      if (settled.status === "fulfilled") {
        return { service, created: settled.value, skipped: 0, failed: 0, errors: [] };
      }
      return { service, created: 0, skipped: 0, failed: 1, errors: [String((settled.reason as Error).message ?? settled.reason)] };
    }

    const results: ServiceResult[] = [
      toCountResult("s3", s3),
      toCountResult("sqs", sqs),
      toCountResult("dynamodb", dynamo),
      toCountResult("lambda", lambda),
      toCountResult("sns", sns),
    ];

    return { status: "success", data: { results, dryRun: true } };
  }

  // Execute: delete all resources via Promise.allSettled
  const [s3, sqs, dynamo, lambda, sns] = await Promise.allSettled([
    resetS3({ dryRun: false }),
    resetSQS({ dryRun: false }),
    resetDynamoDB({ dryRun: false }),
    resetLambda({ dryRun: false }),
    resetSNS({ dryRun: false }),
  ]);

  function toDeleteResult(
    service: ServiceKey,
    settled: PromiseSettledResult<{ deleted: string[]; failed: string[] }>,
  ): ServiceResult {
    if (settled.status === "fulfilled") {
      return {
        service,
        created: settled.value.deleted.length,
        skipped: 0,
        failed: settled.value.failed.length,
        errors: settled.value.failed,
      };
    }
    return {
      service,
      created: 0,
      skipped: 0,
      failed: 1,
      errors: [String((settled.reason as Error).message ?? settled.reason)],
    };
  }

  const results: ServiceResult[] = [
    toDeleteResult("s3", s3),
    toDeleteResult("sqs", sqs),
    toDeleteResult("dynamodb", dynamo),
    toDeleteResult("lambda", lambda),
    toDeleteResult("sns", sns),
  ];

  revalidatePath("/", "layout");

  return { status: "success", data: { results, dryRun: false } };
}
