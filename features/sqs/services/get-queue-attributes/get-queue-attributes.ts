import "server-only";

import { GetQueueAttributesCommand } from "@aws-sdk/client-sqs";
import { getSQSClient } from "@/features/sqs/lib/client";
import { toFriendlyError } from "@/features/sqs/lib/errors";

export async function getQueueAttributes(queueUrl: string): Promise<Record<string, string>> {
  try {
    const client = getSQSClient();
    const { Attributes } = await client.send(
      new GetQueueAttributesCommand({
        QueueUrl: queueUrl,
        AttributeNames: ["All"],
      }),
    );
    return { ...(Attributes ?? {}) };
  } catch (err) {
    const { code, message } = toFriendlyError(err);
    throw Object.assign(new Error(message), { name: code });
  }
}
