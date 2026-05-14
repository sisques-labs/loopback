"use server";

import "server-only";
import { PublishCommand } from "@aws-sdk/client-sns";
import { revalidatePath } from "next/cache";
import { getSNSClient } from "@/features/sns/lib/client";
import { toFriendlyError } from "@/features/sns/lib/errors";
import type { ActionState } from "@/features/shared/types/action-state";

export async function publishMessageAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const topicArn = (formData.get("topicArn") as string | null) ?? "";
  const message = (formData.get("message") as string | null) ?? "";
  const subject = (formData.get("subject") as string | null) ?? "";

  if (!message.trim()) {
    return { status: "error", message: "Message cannot be empty." };
  }

  try {
    const client = getSNSClient();
    await client.send(
      new PublishCommand({
        TopicArn: topicArn,
        Message: message,
        ...(subject ? { Subject: subject } : {}),
      }),
    );
    revalidatePath("/sns", "layout");
    return { status: "success", data: undefined };
  } catch (err) {
    const { message: errMsg } = toFriendlyError(err);
    return { status: "error", message: errMsg };
  }
}
