"use server";
import "server-only";

import { PutCommand } from "@aws-sdk/lib-dynamodb";
import { revalidatePath } from "next/cache";
import { getDictionary } from "@/features/shared/i18n/get-dictionary";
import { DEFAULT_LOCALE, isLocale, type Locale } from "@/features/shared/i18n/locale";
import { getDynamoDBDocumentClient } from "@/features/dynamodb/lib/client";
import { toFriendlyError } from "@/features/dynamodb/lib/errors";
import type { ActionState } from "@/features/shared/types/action-state";

export async function putItemAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const tableName = (formData.get("tableName") as string | null) ?? "";
  const itemJson = (formData.get("itemJson") as string | null) ?? "";
  const localeRaw = (formData.get("locale") as string | null) ?? "";
  const locale: Locale = isLocale(localeRaw) ? localeRaw : DEFAULT_LOCALE;
  const dict = getDictionary(locale).dynamodb;

  // Validate non-empty JSON
  if (!itemJson.trim()) {
    return { status: "error", message: dict.putItemDialog.invalidJson };
  }

  // Parse and validate JSON
  let parsed: unknown;
  try {
    parsed = JSON.parse(itemJson);
  } catch {
    return { status: "error", message: dict.putItemDialog.invalidJson };
  }

  // Must be a plain object (not array, not null, not primitive)
  if (
    typeof parsed !== "object" ||
    parsed === null ||
    Array.isArray(parsed)
  ) {
    return { status: "error", message: dict.putItemDialog.notObject };
  }

  try {
    const client = await getDynamoDBDocumentClient();

    await client.send(
      new PutCommand({
        TableName: tableName,
        Item: parsed as Record<string, unknown>,
      }),
    );

    revalidatePath(`/dynamodb/${tableName}`, "layout");
    return { status: "success", data: undefined };
  } catch (err) {
    const { message } = toFriendlyError(err, dict.sdkErrors);
    return { status: "error", message };
  }
}
