"use server";
import "server-only";

import { CreateQueueCommand } from "@aws-sdk/client-sqs";
import { revalidatePath } from "next/cache";
import { getDictionary } from "@/features/shared/i18n/get-dictionary";
import { DEFAULT_LOCALE, isLocale, type Locale } from "@/features/shared/i18n/locale";
import { getSQSClient } from "@/features/sqs/lib/client";
import { toFriendlyError } from "@/features/sqs/lib/errors";
import { finalQueueName, validateQueueNameInput } from "@/features/sqs/lib/validate-queue-name";
import type { ActionState } from "@/features/shared/types/action-state";

export async function createQueueAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const name = (formData.get("name") as string | null) ?? "";
  const isFifo = formData.get("isFifo") === "true";
  const localeRaw = (formData.get("locale") as string | null) ?? "";
  const locale: Locale = isLocale(localeRaw) ? localeRaw : DEFAULT_LOCALE;
  const validationMessages = getDictionary(locale).sqs.createQueueValidation;

  const code = validateQueueNameInput(name, isFifo);
  if (code) {
    return { status: "error", message: validationMessages[code] };
  }

  const queueName = finalQueueName(name.trim(), isFifo);

  try {
    const client = getSQSClient();
    await client.send(
      new CreateQueueCommand({
        QueueName: queueName,
        ...(isFifo
          ? {
              Attributes: {
                FifoQueue: "true",
              },
            }
          : {}),
      }),
    );
    revalidatePath("/sqs", "layout");
    return { status: "success", data: undefined };
  } catch (err) {
    const { message } = toFriendlyError(err);
    return { status: "error", message };
  }
}
