import "server-only";

import { CreateFunctionCommand, PackageType, type Runtime } from "@aws-sdk/client-lambda";
import { getLambdaClient } from "@/features/lambda/lib/client";
import { STUB_ZIP_BUFFER } from "@/features/lambda/lib/stub-zip";
import type { LambdaResource } from "@/features/seed/presets/schema";

const SKIP_ERROR_NAMES = new Set(["ResourceConflictException"]);

type SeedResult = { created: string[]; skipped: string[]; failed: string[] };

/**
 * Creates Lambda functions for the given preset Lambda resources.
 * Uses STUB_ZIP_BUFFER so functions are immediately invokable in LocalStack.
 * Per-function try/catch — one failure does not block others.
 */
export async function seedLambda(
  functions: LambdaResource[],
): Promise<SeedResult> {
  if (functions.length === 0) return { created: [], skipped: [], failed: [] };

  const client = await getLambdaClient();
  const created: string[] = [];
  const skipped: string[] = [];
  const failed: string[] = [];

  await Promise.allSettled(
    functions.map(async (fn) => {
      try {
        await client.send(
          new CreateFunctionCommand({
            FunctionName: fn.name,
            Runtime: fn.runtime as Runtime,
            Role: fn.role,
            Handler: fn.handler,
            Code: { ZipFile: STUB_ZIP_BUFFER },
            PackageType: PackageType.Zip,
          }),
        );
        created.push(fn.name);
      } catch (err) {
        const name = (err as { name?: string }).name ?? "";
        if (SKIP_ERROR_NAMES.has(name)) {
          skipped.push(fn.name);
        } else {
          failed.push(fn.name);
        }
      }
    }),
  );

  return { created, skipped, failed };
}
