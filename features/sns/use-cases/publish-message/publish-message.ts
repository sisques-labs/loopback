"use server";

import "server-only";
import { PublishCommand } from "@aws-sdk/client-sns";
import { revalidatePath } from "next/cache";
import { getDictionary } from "@/features/shared/i18n/get-dictionary";
import { DEFAULT_LOCALE, isLocale, type Locale } from "@/features/shared/i18n/locale";
import { getSNSClient } from "@/features/sns/lib/client";
import { toFriendlyError } from "@/features/sns/lib/errors";
import { sanitizeJson } from "@/features/shared/utils/sanitize-json/sanitize-json";
import type { ActionState } from "@/features/shared/types/action-state";

const SNS_MAX_BYTES = 256 * 1024; // 256 KB — AWS SNS message size limit

export async function publishMessageAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const topicArn = (formData.get("topicArn") as string | null) ?? "";
  const message = (formData.get("message") as string | null) ?? "";
  const subject = (formData.get("subject") as string | null) ?? "";
  const localeRaw = (formData.get("locale") as string | null) ?? "";
  const locale: Locale = isLocale(localeRaw) ? localeRaw : DEFAULT_LOCALE;
  const dict = getDictionary(locale);

  if (!message.trim()) {
    return { status: "error", message: dict.sns.validation.messageRequired };
  }

  // Validate JSON structure when the message looks like JSON (starts with { or [).
  // Plain-string SNS messages (e.g. "Hello!") bypass JSON validation.
  const trimmed = message.trim();
  if (trimmed[0] === "{" || trimmed[0] === "[") {
    const result = sanitizeJson(message, { maxBytes: SNS_MAX_BYTES });
    if (!result.ok) {
      const msg =
        result.error === "PAYLOAD_TOO_LARGE"
          ? dict.sns.publishDialog.tooLarge
          : dict.sns.publishDialog.invalidJson;
      return { status: "error", message: msg };
    }
  }

  try {
    const client = await getSNSClient();
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
    const { message: errMsg } = toFriendlyError(err, dict.sns.sdkErrors);
    return { status: "error", message: errMsg };
  }
}
