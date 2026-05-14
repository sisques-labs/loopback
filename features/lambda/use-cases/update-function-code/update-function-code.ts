import "server-only";

import { UpdateFunctionCodeCommand } from "@aws-sdk/client-lambda";
import { getLambdaClient } from "@/features/lambda/lib/client";

export async function updateFunctionCode(input: { functionName: string; file: File }): Promise<void> {
  const buffer = Buffer.from(await input.file.arrayBuffer());
  const client = getLambdaClient();
  await client.send(
    new UpdateFunctionCodeCommand({
      FunctionName: input.functionName,
      ZipFile: buffer,
      Publish: false,
    }),
  );
}
