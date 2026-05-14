"use server";

import { DeleteTopicCommand } from "@aws-sdk/client-sns";
import { revalidatePath } from "next/cache";
import { getSNSClient } from "@/features/sns/lib/client";
import { toFriendlyError } from "@/features/sns/lib/errors";
import type { ActionState } from "@/features/shared/types/action-state";

export async function deleteTopicAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const topicArn = (formData.get("topicArn") as string | null) ?? "";
  if (!topicArn) return { status: "error", message: "Topic ARN is required." };

  try {
    const client = getSNSClient();
    await client.send(new DeleteTopicCommand({ TopicArn: topicArn }));
    revalidatePath("/sns", "layout");
    return { status: "success", data: undefined };
  } catch (err) {
    const { message } = toFriendlyError(err);
    return { status: "error", message };
  }
}
