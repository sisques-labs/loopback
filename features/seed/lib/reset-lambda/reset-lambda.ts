import "server-only";

import { ListFunctionsCommand, DeleteFunctionCommand, type ListFunctionsCommandOutput } from "@aws-sdk/client-lambda";
import { getLambdaClient } from "@/features/lambda/lib/client";

type DeleteResult = { deleted: string[]; failed: string[] };

/**
 * Dry-run overload: returns total function count without deleting anything.
 */
export async function resetLambda(opts: { dryRun: true }): Promise<number>;
/**
 * Execute overload: deletes all Lambda functions, returns per-function results.
 */
export async function resetLambda(opts?: { dryRun: false } | undefined): Promise<DeleteResult>;
export async function resetLambda(
  opts?: { dryRun: boolean },
): Promise<number | DeleteResult> {
  const dryRun = opts?.dryRun ?? false;
  const client = await getLambdaClient();

  // Collect all function names (paginated via Marker)
  const functionNames: string[] = [];
  let marker: string | undefined = undefined;
  do {
    const res: ListFunctionsCommandOutput = await client.send(
      new ListFunctionsCommand({ ...(marker ? { Marker: marker } : {}) }),
    );
    for (const fn of res.Functions ?? []) {
      if (fn.FunctionName) functionNames.push(fn.FunctionName);
    }
    marker = res.NextMarker;
  } while (marker);

  if (dryRun) {
    return functionNames.length;
  }

  const deleted: string[] = [];
  const failed: string[] = [];

  await Promise.allSettled(
    functionNames.map(async (name) => {
      try {
        await client.send(new DeleteFunctionCommand({ FunctionName: name }));
        deleted.push(name);
      } catch {
        failed.push(name);
      }
    }),
  );

  return { deleted, failed };
}
