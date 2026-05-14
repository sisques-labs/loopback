"use server";

import "server-only";

import { SubscribeCommand } from "@aws-sdk/client-sns";
import { revalidatePath } from "next/cache";
import { getDictionary } from "@/features/shared/i18n/get-dictionary";
import { DEFAULT_LOCALE, isLocale, type Locale } from "@/features/shared/i18n/locale";
import { getSNSClient } from "@/features/sns/lib/client";
import { toFriendlyError } from "@/features/sns/lib/errors";
import type { ActionState } from "@/features/shared/types/action-state";

export async function subscribeAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const topicArn = (formData.get("topicArn") as string | null) ?? "";
  const protocol = (formData.get("protocol") as string | null) ?? "";
  const endpoint = (formData.get("endpoint") as string | null) ?? "";
  const isFifo = formData.get("isFifo") === "true";
  const localeRaw = (formData.get("locale") as string | null) ?? "";
  const locale: Locale = isLocale(localeRaw) ? localeRaw : DEFAULT_LOCALE;
  const dict = getDictionary(locale);

  if (!topicArn) return { status: "error", message: dict.sns.validation.topicArnRequired };
  if (!protocol) return { status: "error", message: dict.sns.validation.protocolRequired };
  if (!endpoint) return { status: "error", message: dict.sns.validation.endpointRequired };

  if (isFifo && protocol !== "sqs") {
    return { status: "error", message: dict.sns.validation.fifoSqsOnly };
  }

  try {
    const client = getSNSClient();
    await client.send(
      new SubscribeCommand({ TopicArn: topicArn, Protocol: protocol, Endpoint: endpoint }),
    );
    revalidatePath("/sns", "layout");
    return { status: "success", data: undefined };
  } catch (err) {
    const { message } = toFriendlyError(err, dict.sns.sdkErrors);
    return { status: "error", message };
  }
}
