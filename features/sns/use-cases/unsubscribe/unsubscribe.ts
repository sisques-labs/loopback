"use server";

import "server-only";

import { UnsubscribeCommand } from "@aws-sdk/client-sns";
import { revalidatePath } from "next/cache";
import { getSNSClient } from "@/features/sns/lib/client";
import { toFriendlyError } from "@/features/sns/lib/errors";
import type { ActionState } from "@/features/shared/types/action-state";

export async function unsubscribeAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const subscriptionArn = (formData.get("subscriptionArn") as string | null) ?? "";

  if (!subscriptionArn || subscriptionArn === "PendingConfirmation") {
    return { status: "error", message: "Cannot unsubscribe a pending subscription." };
  }

  try {
    const client = getSNSClient();
    await client.send(new UnsubscribeCommand({ SubscriptionArn: subscriptionArn }));
    revalidatePath("/sns", "layout");
    return { status: "success", data: undefined };
  } catch (err) {
    const { message } = toFriendlyError(err);
    return { status: "error", message };
  }
}
