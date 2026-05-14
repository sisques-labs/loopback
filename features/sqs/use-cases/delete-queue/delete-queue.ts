"use server";

import { DeleteQueueCommand } from "@aws-sdk/client-sqs";
import { revalidatePath } from "next/cache";
import { getSQSClient } from "@/features/sqs/lib/client";
import { toFriendlyError } from "@/features/sqs/lib/errors";
import type { ActionState } from "@/features/shared/types/action-state";

export async function deleteQueueAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const queueUrl = (formData.get("queueUrl") as string | null) ?? "";
  if (!queueUrl) return { status: "error", message: "Queue URL is required." };

  try {
    const client = getSQSClient();
    await client.send(new DeleteQueueCommand({ QueueUrl: queueUrl }));
    revalidatePath("/sqs", "layout");
    return { status: "success", data: undefined };
  } catch (err) {
    const { message } = toFriendlyError(err);
    return { status: "error", message };
  }
}
