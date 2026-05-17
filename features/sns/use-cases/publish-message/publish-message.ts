"use server";

import "server-only";
import { PublishCommand } from "@aws-sdk/client-sns";
import { revalidatePath } from "next/cache";
import { getDictionary } from "@/features/shared/i18n/get-dictionary";
import { DEFAULT_LOCALE, isLocale, type Locale } from "@/features/shared/i18n/locale";
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
  const localeRaw = (formData.get("locale") as string | null) ?? "";
  const locale: Locale = isLocale(localeRaw) ? localeRaw : DEFAULT_LOCALE;
  const dict = getDictionary(locale);

  if (!message.trim()) {
    return { status: "error", message: dict.sns.validation.messageRequired };
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
