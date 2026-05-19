"use server";

import { listQueues } from "@/features/sqs/services/list-queues/list-queues";
import type { QueueListItem } from "@/features/sqs/types/sqs";

export async function listQueuesAction(): Promise<QueueListItem[]> {
  return listQueues();
}
