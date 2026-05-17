import "server-only";

import { ListQueuesCommand, type ListQueuesCommandOutput } from "@aws-sdk/client-sqs";
import type { QueueListItem } from "@/features/sqs/types/sqs";
import { getSQSClient } from "@/features/sqs/lib/client";
import { toFriendlyError } from "@/features/sqs/lib/errors";
import { queueNameFromUrl } from "@/features/sqs/lib/queue-url-display";

export async function listQueues(): Promise<QueueListItem[]> {
  try {
    const client = await getSQSClient();
    const urls: string[] = [];
    let nextToken: string | undefined = undefined;

    do {
      const res: ListQueuesCommandOutput = await client.send(
        new ListQueuesCommand({ NextToken: nextToken }),
      );
      for (const u of res.QueueUrls ?? []) {
        urls.push(u);
      }
      nextToken = res.NextToken;
    } while (nextToken);

    return urls.map((queueUrl) => {
      const name = queueNameFromUrl(queueUrl);
      return {
        queueUrl,
        name,
        isFifo: name.endsWith(".fifo"),
      };
    });
  } catch (err) {
    const { code, message } = toFriendlyError(err);
    throw Object.assign(new Error(message), { name: code });
  }
}
