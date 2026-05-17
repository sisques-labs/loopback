"use server";
import "server-only";

import { DeleteCommand } from "@aws-sdk/lib-dynamodb";
import { revalidatePath } from "next/cache";
import { getDictionary } from "@/features/shared/i18n/get-dictionary";
import { DEFAULT_LOCALE, isLocale, type Locale } from "@/features/shared/i18n/locale";
import { getDynamoDBDocumentClient } from "@/features/dynamodb/lib/client";
import { toFriendlyError } from "@/features/dynamodb/lib/errors";
import type { ActionState } from "@/features/shared/types/action-state";

export async function deleteItemAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const tableName = (formData.get("tableName") as string | null) ?? "";
  const keyJson = (formData.get("keyJson") as string | null) ?? "";
  const localeRaw = (formData.get("locale") as string | null) ?? "";
  const locale: Locale = isLocale(localeRaw) ? localeRaw : DEFAULT_LOCALE;
  const dict = getDictionary(locale).dynamodb;

  if (!tableName.trim()) {
    return { status: "error", message: dict.createTableValidation.nameRequired };
  }

  let key: Record<string, unknown>;
  try {
    const parsed = JSON.parse(keyJson);
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
      return { status: "error", message: dict.putItemDialog.invalidJson };
    }
    key = parsed as Record<string, unknown>;
  } catch {
    return { status: "error", message: dict.putItemDialog.invalidJson };
  }

  try {
    const client = await getDynamoDBDocumentClient();

    await client.send(
      new DeleteCommand({
        TableName: tableName,
        Key: key,
      }),
    );

    revalidatePath(`/dynamodb/${tableName}`, "layout");
    return { status: "success", data: undefined };
  } catch (err) {
    const { message } = toFriendlyError(err, dict.sdkErrors);
    return { status: "error", message };
  }
}
