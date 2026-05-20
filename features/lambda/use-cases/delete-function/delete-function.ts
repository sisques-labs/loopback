"use server";

import "server-only";
import { DeleteFunctionCommand } from "@aws-sdk/client-lambda";
import { getLambdaClient } from "@/features/lambda/lib/client";

/**
 * Deletes a Lambda function by name.
 * Resolves with `{ success: true }` on success.
 * Throws on any SDK error (ResourceNotFoundException, etc.) — callers should map to user message.
 */
export async function deleteFunction(name: string): Promise<{ success: true }> {
  const client = await getLambdaClient();
  await client.send(
    new DeleteFunctionCommand({ FunctionName: name }),
  );
  return { success: true };
}
