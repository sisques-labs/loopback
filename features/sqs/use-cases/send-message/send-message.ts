"use server";

import "server-only";

import { randomUUID } from "node:crypto";
import { SendMessageCommand } from "@aws-sdk/client-sqs";
import { revalidatePath } from "next/cache";
import { getDictionary } from "@/features/shared/i18n/get-dictionary";
import { DEFAULT_LOCALE, isLocale, type Locale } from "@/features/shared/i18n/locale";
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
  const localeRaw = (formData.get("locale") as string | null) ?? "";
  const locale: Locale = isLocale(localeRaw) ? localeRaw : DEFAULT_LOCALE;
  const dict = getDictionary(locale);

  if (!queueUrl) return { status: "error", message: dict.sqs.validation.queueUrlRequired };
  if (!body.trim()) return { status: "error", message: dict.sqs.validation.messageRequired };

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
    const { message: errMsg } = toFriendlyError(err, dict.sqs.sdkErrors);
    return { status: "error", message: errMsg };
  }
}
