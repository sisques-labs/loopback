"use server";

import "server-only";

import { ReceiveMessageCommand } from "@aws-sdk/client-sqs";
import { revalidatePath } from "next/cache";
import { getDictionary } from "@/features/shared/i18n/get-dictionary";
import { DEFAULT_LOCALE, isLocale, type Locale } from "@/features/shared/i18n/locale";
import { getSQSClient } from "@/features/sqs/lib/client";
import { toFriendlyError } from "@/features/sqs/lib/errors";
import type { ActionState } from "@/features/shared/types/action-state";

export type SqsReceivedMessageBrief = {
  messageId: string;
  body: string;
  receiptHandle: string;
};

const MAX_MESSAGES = 5;
const WAIT_SECONDS = 2;

export type ReceiveMessagesSuccess = { messages: SqsReceivedMessageBrief[] };

export async function receiveMessagesAction(
  _prev: ActionState<ReceiveMessagesSuccess>,
  formData: FormData,
): Promise<ActionState<ReceiveMessagesSuccess>> {
  const queueUrl = (formData.get("queueUrl") as string | null) ?? "";
  const localeRaw = (formData.get("locale") as string | null) ?? "";
  const locale: Locale = isLocale(localeRaw) ? localeRaw : DEFAULT_LOCALE;
  const dict = getDictionary(locale);

  if (!queueUrl) return { status: "error", message: dict.sqs.validation.queueUrlRequired };

  try {
    const client = getSQSClient();
    const out = await client.send(
      new ReceiveMessageCommand({
        QueueUrl: queueUrl,
        MaxNumberOfMessages: MAX_MESSAGES,
        WaitTimeSeconds: WAIT_SECONDS,
        AttributeNames: ["All"],
        MessageAttributeNames: ["All"],
      }),
    );

    const messages: SqsReceivedMessageBrief[] = (out.Messages ?? []).map((m) => ({
      messageId: m.MessageId ?? "(unknown)",
      body: m.Body ?? "",
      receiptHandle: m.ReceiptHandle ?? "",
    }));

    revalidatePath("/sqs", "layout");
    return { status: "success", data: { messages } };
  } catch (err) {
    const { message: errMsg } = toFriendlyError(err, dict.sqs.sdkErrors);
    return { status: "error", message: errMsg };
  }
}
