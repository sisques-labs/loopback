"use server";
import "server-only";

import { CreateTopicCommand } from "@aws-sdk/client-sns";
import { revalidatePath } from "next/cache";
import { getSNSClient } from "@/features/sns/lib/client";
import { toFriendlyError } from "@/features/sns/lib/errors";
import type { ActionState } from "@/features/shared/types/action-state";

// SNS topic names: alphanumeric, hyphens, underscores. 1-256 chars.
// FIFO topics must end with .fifo (added in Phase 2 UI).
const SNS_TOPIC_NAME_REGEX = /^[A-Za-z0-9_-]{1,256}$/;

function validateTopicName(name: string): string | null {
  if (!name || name.trim().length === 0) return "Topic name is required.";
  const trimmed = name.trim();
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
  const validationError = validateTopicName(name);
  if (validationError) return { status: "error", message: validationError };

  try {
    const client = getSNSClient();
    await client.send(new CreateTopicCommand({ Name: name.trim() }));
    revalidatePath("/sns");
    return { status: "success", data: undefined };
  } catch (err) {
    const { message } = toFriendlyError(err);
    return { status: "error", message };
  }
}
