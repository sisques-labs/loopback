"use server";

import "server-only";

import { PurgeQueueCommand } from "@aws-sdk/client-sqs";
import { revalidatePath } from "next/cache";
import { getDictionary } from "@/features/shared/i18n/get-dictionary";
import { DEFAULT_LOCALE, isLocale, type Locale } from "@/features/shared/i18n/locale";
import { getSQSClient } from "@/features/sqs/lib/client";
import { toFriendlyError } from "@/features/sqs/lib/errors";
import type { ActionState } from "@/features/shared/types/action-state";

export async function purgeQueueAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const queueUrl = (formData.get("queueUrl") as string | null) ?? "";
  const localeRaw = (formData.get("locale") as string | null) ?? "";
  const locale: Locale = isLocale(localeRaw) ? localeRaw : DEFAULT_LOCALE;
  const dict = getDictionary(locale);

  if (!queueUrl) return { status: "error", message: dict.sqs.validation.queueUrlRequired };

  try {
    const client = getSQSClient();
    await client.send(new PurgeQueueCommand({ QueueUrl: queueUrl }));
    revalidatePath("/sqs", "layout");
    return { status: "success", data: undefined };
  } catch (err) {
    const { message: errMsg } = toFriendlyError(err, dict.sqs.sdkErrors);
    return { status: "error", message: errMsg };
  }
}
