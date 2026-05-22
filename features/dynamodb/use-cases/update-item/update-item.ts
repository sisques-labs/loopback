"use server";
import "server-only";

import { UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { revalidatePath } from "next/cache";
import { getDictionary } from "@/features/shared/i18n/get-dictionary";
import { DEFAULT_LOCALE, isLocale, type Locale } from "@/features/shared/i18n/locale";
import { getDynamoDBDocumentClient } from "@/features/dynamodb/lib/client";
import { toFriendlyError } from "@/features/dynamodb/lib/errors";
import { sanitizeJson } from "@/features/shared/utils/sanitize-json/sanitize-json";
import type { ActionState } from "@/features/shared/types/action-state";

const DYNAMODB_MAX_BYTES = 400 * 1024; // 400 KB — DynamoDB item size limit

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

  // Parse, validate size, and scrub proto-pollution for itemJson
  const itemSanitizeResult = sanitizeJson(itemJson, { maxBytes: DYNAMODB_MAX_BYTES });
  if (!itemSanitizeResult.ok) {
    const msg =
      itemSanitizeResult.error === "PAYLOAD_TOO_LARGE"
        ? dict.editItemDialog.tooLarge
        : dict.editItemDialog.invalidJson;
    return { status: "error", message: msg };
  }
  const parsed = itemSanitizeResult.value;

  // Must be a plain object (not array, not null, not primitive) — PRESERVED from original
  if (
    typeof parsed !== "object" ||
    parsed === null ||
    Array.isArray(parsed)
  ) {
    return { status: "error", message: dict.editItemDialog.notObject };
  }

  // Parse, validate size, and scrub proto-pollution for keyJson
  const keySanitizeResult = sanitizeJson(keyJson, { maxBytes: DYNAMODB_MAX_BYTES });
  if (!keySanitizeResult.ok) {
    return { status: "error", message: dict.editItemDialog.invalidJson };
  }
  const parsedKey = keySanitizeResult.value;
  if (
    typeof parsedKey !== "object" ||
    parsedKey === null ||
    Array.isArray(parsedKey)
  ) {
    return { status: "error", message: dict.editItemDialog.invalidJson };
  }
  const key = parsedKey as Record<string, unknown>;

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
    const client = await getDynamoDBDocumentClient();

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
