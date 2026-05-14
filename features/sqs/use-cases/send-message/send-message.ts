"use server";

import "server-only";

import { randomUUID } from "node:crypto";
import { SendMessageCommand } from "@aws-sdk/client-sqs";
import { revalidatePath } from "next/cache";
import { getSQSClient } from "@/features/sqs/lib/client";
import { toFriendlyError } from "@/features/sqs/lib/errors";
import type { ActionState } from "@/features/shared/types/action-state";

const MAX_BODY_BYTES = 256 * 1024;

export async function sendMessageAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const queueUrl = (formData.get("queueUrl") as string | null) ?? "";
  const body = (formData.get("body") as string | null) ?? "";
  const isFifo = formData.get("isFifo") === "true";

  if (!queueUrl) return { status: "error", message: "Queue URL is required." };
  if (!body.trim()) return { status: "error", message: "Message body cannot be empty." };

  const bytes = new TextEncoder().encode(body).length;
  if (bytes > MAX_BODY_BYTES) {
    return {
      status: "error",
      message: `Message body exceeds ${MAX_BODY_BYTES} bytes (SQS limit).`,
    };
  }

  try {
    const client = getSQSClient();
    await client.send(
      new SendMessageCommand({
        QueueUrl: queueUrl,
        MessageBody: body,
        ...(isFifo
          ? {
              MessageGroupId: "default",
              MessageDeduplicationId: randomUUID(),
            }
          : {}),
      }),
    );
    revalidatePath("/sqs", "layout");
    return { status: "success", data: undefined };
  } catch (err) {
    const { message: errMsg } = toFriendlyError(err);
    return { status: "error", message: errMsg };
  }
}
