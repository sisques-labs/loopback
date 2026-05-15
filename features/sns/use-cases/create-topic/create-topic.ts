"use server";
import "server-only";

import { CreateTopicCommand } from "@aws-sdk/client-sns";
import { revalidatePath } from "next/cache";
import { getDictionary } from "@/features/shared/i18n/get-dictionary";
import { DEFAULT_LOCALE, isLocale, type Locale } from "@/features/shared/i18n/locale";
import { getSNSClient } from "@/features/sns/lib/client";
import { toFriendlyError } from "@/features/sns/lib/errors";
import type { ActionState } from "@/features/shared/types/action-state";

// Validates the base topic name (before any .fifo suffix is appended).
const SNS_TOPIC_NAME_REGEX = /^[A-Za-z0-9_-]{1,256}$/;

function validateTopicName(baseName: string, validation: { topicNameRequired: string; topicNameInvalid: string }): string | null {
  if (!baseName || baseName.trim().length === 0) return validation.topicNameRequired;
  const trimmed = baseName.trim();
  if (!SNS_TOPIC_NAME_REGEX.test(trimmed)) {
    return validation.topicNameInvalid;
  }
  return null;
}

export async function createTopicAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const name = (formData.get("name") as string | null) ?? "";
  const isFifo = formData.get("isFifo") === "true";
  const localeRaw = (formData.get("locale") as string | null) ?? "";
  const locale: Locale = isLocale(localeRaw) ? localeRaw : DEFAULT_LOCALE;
  const dict = getDictionary(locale);

  const baseName = name.trim();
  const validationError = validateTopicName(baseName, dict.sns.validation);
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
    const { message } = toFriendlyError(err, dict.sns.sdkErrors);
    return { status: "error", message };
  }
}
