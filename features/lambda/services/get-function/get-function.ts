import "server-only";

import { GetFunctionCommand } from "@aws-sdk/client-lambda";
import type { LambdaFunction } from "@/features/lambda/types/lambda";
import { getLambdaClient } from "@/features/lambda/lib/client";
import { toFriendlyError } from "@/features/lambda/lib/errors";

export async function getFunction(functionName: string): Promise<LambdaFunction> {
  try {
    const client = await getLambdaClient();
    const res = await client.send(new GetFunctionCommand({ FunctionName: functionName }));
    const cfg = res.Configuration;

    return {
      functionName: cfg?.FunctionName ?? "",
      functionArn: cfg?.FunctionArn ?? "",
      runtime: cfg?.Runtime ?? "",
      handler: cfg?.Handler ?? "",
      description: cfg?.Description ?? "",
      timeout: cfg?.Timeout ?? 0,
      memorySize: cfg?.MemorySize ?? 0,
      lastModified: cfg?.LastModified ?? "",
      state: cfg?.State ?? "",
    };
  } catch (err) {
    const { code, message } = toFriendlyError(err);
    throw Object.assign(new Error(message), { name: code });
  }
}
