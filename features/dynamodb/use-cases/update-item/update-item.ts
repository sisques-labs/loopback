"use server";
import "server-only";

import { UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { revalidatePath } from "next/cache";
import { getDictionary } from "@/features/shared/i18n/get-dictionary";
import { DEFAULT_LOCALE, isLocale, type Locale } from "@/features/shared/i18n/locale";
import { getDynamoDBDocumentClient } from "@/features/dynamodb/lib/client";
import { toFriendlyError } from "@/features/dynamodb/lib/errors";
import type { ActionState } from "@/features/shared/types/action-state";

export async function updateItemAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const tableName = (formData.get("tableName") as string | null) ?? "";
  const keyJson = (formData.get("keyJson") as string | null) ?? "";
  const itemJson = (formData.get("itemJson") as string | null) ?? "";
  const localeRaw = (formData.get("locale") as string | null) ?? "";
  const locale: Locale = isLocale(localeRaw) ? localeRaw : DEFAULT_LOCALE;
  const dict = getDictionary(locale).dynamodb;

  // Validate non-empty JSON
  if (!itemJson.trim()) {
    return { status: "error", message: dict.editItemDialog.invalidJson };
  }

  // Parse and validate itemJson
  let parsed: unknown;
  try {
    parsed = JSON.parse(itemJson);
  } catch {
    return { status: "error", message: dict.editItemDialog.invalidJson };
  }

  if (
    typeof parsed !== "object" ||
    parsed === null ||
    Array.isArray(parsed)
  ) {
    return { status: "error", message: dict.editItemDialog.notObject };
  }

  // Parse keyJson
  let key: Record<string, unknown>;
  try {
    const parsedKey = JSON.parse(keyJson);
    if (
      typeof parsedKey !== "object" ||
      parsedKey === null ||
      Array.isArray(parsedKey)
    ) {
      throw new Error("keyJson must be a plain object");
    }
    key = parsedKey as Record<string, unknown>;
  } catch {
    return { status: "error", message: dict.editItemDialog.invalidJson };
  }

  // Strip key attrs from the item to build non-key attrs
  const item = parsed as Record<string, unknown>;
  const keyNames = new Set(Object.keys(key));
  const nonKeyAttrs = Object.fromEntries(
    Object.entries(item).filter(([k]) => !keyNames.has(k)),
  );

  // Empty non-key attrs guard — no-op
  const attrEntries = Object.entries(nonKeyAttrs);
  if (attrEntries.length === 0) {
    return { status: "success", data: undefined };
  }

  // Build dynamic SET expression with aliased names/values
  const expressionParts: string[] = [];
  const ExpressionAttributeNames: Record<string, string> = {};
  const ExpressionAttributeValues: Record<string, unknown> = {};

  attrEntries.forEach(([attrName, attrValue], i) => {
    const nameAlias = `#a${i}`;
    const valAlias = `:v${i}`;
    expressionParts.push(`${nameAlias} = ${valAlias}`);
    ExpressionAttributeNames[nameAlias] = attrName;
    ExpressionAttributeValues[valAlias] = attrValue;
  });

  const UpdateExpression = `SET ${expressionParts.join(", ")}`;

  try {
    const client = getDynamoDBDocumentClient();

    await client.send(
      new UpdateCommand({
        TableName: tableName,
        Key: key,
        UpdateExpression,
        ExpressionAttributeNames,
        ExpressionAttributeValues,
      }),
    );

    revalidatePath(`/dynamodb/${tableName}`, "layout");
    return { status: "success", data: undefined };
  } catch (err) {
    const { message } = toFriendlyError(err, dict.sdkErrors);
    return { status: "error", message };
  }
}
