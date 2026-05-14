"use server";
import "server-only";

import { CreateQueueCommand } from "@aws-sdk/client-sqs";
import { revalidatePath } from "next/cache";
import { getSQSClient } from "@/features/sqs/lib/client";
import { toFriendlyError } from "@/features/sqs/lib/errors";
import type { ActionState } from "@/features/shared/types/action-state";

const SQS_QUEUE_NAME_PART = /^[A-Za-z0-9_-]+$/;

function finalQueueName(trimmed: string, isFifo: boolean): string {
  if (!isFifo) return trimmed;
  return trimmed.endsWith(".fifo") ? trimmed : `${trimmed}.fifo`;
}

function validateQueueName(raw: string, isFifo: boolean): string | null {
  if (!raw || raw.trim().length === 0) return "Queue name is required.";
  const trimmed = raw.trim();

  if (!isFifo && trimmed.endsWith(".fifo")) {
    return "Standard queue names cannot end with .fifo. Turn off Standard or use a FIFO queue.";
  }

  const name = finalQueueName(trimmed, isFifo);

  if (name.length > 80) {
    return "Queue name must be at most 80 characters (including .fifo for FIFO queues).";
  }

  if (isFifo) {
    if (!name.endsWith(".fifo")) {
      return "FIFO queue names must end with .fifo.";
    }
    const prefix = name.slice(0, -".fifo".length);
    if (prefix.length === 0 || !SQS_QUEUE_NAME_PART.test(prefix)) {
      return "Queue name may only contain letters, numbers, hyphens, and underscores before .fifo.";
    }
  } else if (!/^[A-Za-z0-9_-]{1,80}$/.test(name)) {
    return "Queue name must be 1–80 characters: letters, numbers, hyphens, or underscores only.";
  }

  return null;
}

export async function createQueueAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const name = (formData.get("name") as string | null) ?? "";
  const isFifo = formData.get("isFifo") === "true";

  const validationError = validateQueueName(name, isFifo);
  if (validationError) return { status: "error", message: validationError };

  const queueName = finalQueueName(name.trim(), isFifo);

  try {
    const client = getSQSClient();
    await client.send(
      new CreateQueueCommand({
        QueueName: queueName,
        ...(isFifo
          ? {
              Attributes: {
                FifoQueue: "true",
              },
            }
          : {}),
      }),
    );
    revalidatePath("/sqs", "layout");
    return { status: "success", data: undefined };
  } catch (err) {
    const { message } = toFriendlyError(err);
    return { status: "error", message };
  }
}
