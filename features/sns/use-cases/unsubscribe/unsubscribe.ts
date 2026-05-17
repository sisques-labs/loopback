"use server";

import "server-only";

import { UnsubscribeCommand } from "@aws-sdk/client-sns";
import { revalidatePath } from "next/cache";
import { getDictionary } from "@/features/shared/i18n/get-dictionary";
import { DEFAULT_LOCALE, isLocale, type Locale } from "@/features/shared/i18n/locale";
import { getSNSClient } from "@/features/sns/lib/client";
import { toFriendlyError } from "@/features/sns/lib/errors";
import type { ActionState } from "@/features/shared/types/action-state";

export async function unsubscribeAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const subscriptionArn = (formData.get("subscriptionArn") as string | null) ?? "";
  const localeRaw = (formData.get("locale") as string | null) ?? "";
  const locale: Locale = isLocale(localeRaw) ? localeRaw : DEFAULT_LOCALE;
  const dict = getDictionary(locale);

  if (!subscriptionArn || subscriptionArn === "PendingConfirmation") {
    return { status: "error", message: dict.sns.validation.pendingUnsubscribe };
  }

  try {
    const client = await getSNSClient();
    await client.send(new UnsubscribeCommand({ SubscriptionArn: subscriptionArn }));
    revalidatePath("/sns", "layout");
    return { status: "success", data: undefined };
  } catch (err) {
    const { message } = toFriendlyError(err, dict.sns.sdkErrors);
    return { status: "error", message };
  }
}
