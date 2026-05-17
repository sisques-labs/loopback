import "server-only";

import {
  ListFunctionsCommand,
  type ListFunctionsCommandOutput,
} from "@aws-sdk/client-lambda";
import type { LambdaFunction } from "@/features/lambda/types/lambda";
import { getLambdaClient } from "@/features/lambda/lib/client";
import { toFriendlyError } from "@/features/lambda/lib/errors";

export async function listFunctions(): Promise<LambdaFunction[]> {
  try {
    const client = await getLambdaClient();
    const functions: LambdaFunction[] = [];
    let nextMarker: string | undefined = undefined;

    do {
      const res: ListFunctionsCommandOutput = await client.send(
        new ListFunctionsCommand({ Marker: nextMarker }),
      );
      for (const fn of res.Functions ?? []) {
        functions.push({
          functionName: fn.FunctionName ?? "",
          functionArn: fn.FunctionArn ?? "",
          runtime: fn.Runtime ?? "",
          handler: fn.Handler ?? "",
          description: fn.Description ?? "",
          timeout: fn.Timeout ?? 0,
          memorySize: fn.MemorySize ?? 0,
          lastModified: fn.LastModified ?? "",
          state: fn.State ?? "",
        });
      }
      nextMarker = res.NextMarker;
    } while (nextMarker);

    return functions;
  } catch (err) {
    const { code, message } = toFriendlyError(err);
    throw Object.assign(new Error(message), { name: code });
  }
}
