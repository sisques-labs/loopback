"use server";
import "server-only";

import { DeleteTableCommand } from "@aws-sdk/client-dynamodb";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getDictionary } from "@/features/shared/i18n/get-dictionary";
import { DEFAULT_LOCALE, isLocale, type Locale } from "@/features/shared/i18n/locale";
import { getDynamoDBClient } from "@/features/dynamodb/lib/client";
import { toFriendlyError } from "@/features/dynamodb/lib/errors";
import type { ActionState } from "@/features/shared/types/action-state";

export async function deleteTableAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const tableName = (formData.get("tableName") as string | null) ?? "";
  const localeRaw = (formData.get("locale") as string | null) ?? "";
  const locale: Locale = isLocale(localeRaw) ? localeRaw : DEFAULT_LOCALE;
  const dict = getDictionary(locale).dynamodb;

  if (!tableName.trim()) {
    return { status: "error", message: dict.createTableValidation.nameRequired };
  }

  try {
    const client = await getDynamoDBClient();

    await client.send(
      new DeleteTableCommand({ TableName: tableName }),
    );

    revalidatePath("/dynamodb", "layout");
  } catch (err) {
    const { message } = toFriendlyError(err, dict.sdkErrors);
    return { status: "error", message };
  }

  redirect(`/${locale}/dynamodb`);
}
