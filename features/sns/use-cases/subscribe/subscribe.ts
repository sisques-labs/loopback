"use server";

import "server-only";

import { SubscribeCommand } from "@aws-sdk/client-sns";
import { revalidatePath } from "next/cache";
import { getSNSClient } from "@/features/sns/lib/client";
import { toFriendlyError } from "@/features/sns/lib/errors";
import type { ActionState } from "@/features/shared/types/action-state";

export async function subscribeAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const topicArn = (formData.get("topicArn") as string | null) ?? "";
  const protocol = (formData.get("protocol") as string | null) ?? "";
  const endpoint = (formData.get("endpoint") as string | null) ?? "";
  const isFifo = formData.get("isFifo") === "true";

  if (!topicArn) return { status: "error", message: "Topic ARN is required." };
  if (!protocol) return { status: "error", message: "Protocol is required." };
  if (!endpoint) return { status: "error", message: "Endpoint is required." };

  if (isFifo && protocol !== "sqs") {
    return { status: "error", message: "FIFO topics only support SQS subscriptions." };
  }

  try {
    const client = getSNSClient();
    await client.send(
      new SubscribeCommand({ TopicArn: topicArn, Protocol: protocol, Endpoint: endpoint }),
    );
    revalidatePath("/sns", "layout");
    return { status: "success", data: undefined };
  } catch (err) {
    const { message } = toFriendlyError(err);
    return { status: "error", message };
  }
}
