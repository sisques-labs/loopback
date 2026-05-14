"use server";
import "server-only";

import { CreateTopicCommand } from "@aws-sdk/client-sns";
import { revalidatePath } from "next/cache";
import { getSNSClient } from "@/features/sns/lib/client";
import { toFriendlyError } from "@/features/sns/lib/errors";
import type { ActionState } from "@/features/shared/types/action-state";

// Validates the base topic name (before any .fifo suffix is appended).
const SNS_TOPIC_NAME_REGEX = /^[A-Za-z0-9_-]{1,256}$/;

function validateTopicName(baseName: string): string | null {
  if (!baseName || baseName.trim().length === 0) return "Topic name is required.";
  const trimmed = baseName.trim();
  if (!SNS_TOPIC_NAME_REGEX.test(trimmed)) {
    return "Topic name must be 1–256 characters, alphanumeric, hyphens, or underscores only.";
  }
  return null;
}

export async function createTopicAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const name = (formData.get("name") as string | null) ?? "";
  const isFifo = formData.get("isFifo") === "true";

  const baseName = name.trim();
  const validationError = validateTopicName(baseName);
  if (validationError) return { status: "error", message: validationError };

  const finalName = isFifo && !baseName.endsWith(".fifo") ? `${baseName}.fifo` : baseName;

  try {
    const client = getSNSClient();
    await client.send(
      new CreateTopicCommand({
        Name: finalName,
        ...(isFifo ? { Attributes: { FifoTopic: "true" } } : {}),
      }),
    );
    revalidatePath("/sns", "layout");
    return { status: "success", data: undefined };
  } catch (err) {
    const { message } = toFriendlyError(err);
    return { status: "error", message };
  }
}
