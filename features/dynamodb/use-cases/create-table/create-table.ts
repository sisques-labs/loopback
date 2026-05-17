"use server";
import "server-only";

import {
  CreateTableCommand,
  BillingMode,
  type AttributeDefinition,
  type KeySchemaElement,
} from "@aws-sdk/client-dynamodb";
import { revalidatePath } from "next/cache";
import { getDictionary } from "@/features/shared/i18n/get-dictionary";
import { DEFAULT_LOCALE, isLocale, type Locale } from "@/features/shared/i18n/locale";
import { getDynamoDBClient } from "@/features/dynamodb/lib/client";
import { toFriendlyError } from "@/features/dynamodb/lib/errors";
import type { ActionState } from "@/features/shared/types/action-state";
import type { KeyType } from "@/features/dynamodb/types/dynamodb";

const TABLE_NAME_REGEX = /^[a-zA-Z0-9._-]{3,255}$/;
const VALID_KEY_TYPES: KeyType[] = ["S", "N", "B"];

export async function createTableAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const tableName = (formData.get("tableName") as string | null) ?? "";
  const partitionKeyName = (formData.get("partitionKeyName") as string | null) ?? "";
  const partitionKeyType = (formData.get("partitionKeyType") as string | null) ?? "";
  const sortKeyName = ((formData.get("sortKeyName") as string | null) ?? "").trim();
  const sortKeyType = ((formData.get("sortKeyType") as string | null) ?? "").trim();
  const localeRaw = (formData.get("locale") as string | null) ?? "";
  const locale: Locale = isLocale(localeRaw) ? localeRaw : DEFAULT_LOCALE;
  const dict = getDictionary(locale).dynamodb;

  // Validate table name
  if (!tableName || !TABLE_NAME_REGEX.test(tableName)) {
    return {
      status: "error",
      message: tableName
        ? dict.createTableValidation.nameInvalid
        : dict.createTableValidation.nameRequired,
    };
  }

  // Validate partition key name
  if (!partitionKeyName.trim()) {
    return { status: "error", message: dict.createTableValidation.pkNameRequired };
  }

  // Validate partition key type
  if (!(VALID_KEY_TYPES as string[]).includes(partitionKeyType)) {
    return { status: "error", message: dict.createTableValidation.pkTypeInvalid };
  }

  // Validate sort key: if name is provided, type must also be provided
  if (sortKeyName && !(VALID_KEY_TYPES as string[]).includes(sortKeyType)) {
    return { status: "error", message: dict.createTableValidation.skIncomplete };
  }

  try {
    const client = await getDynamoDBClient();

    const attributeDefinitions: AttributeDefinition[] = [
      { AttributeName: partitionKeyName.trim(), AttributeType: partitionKeyType as KeyType },
    ];
    const keySchema: KeySchemaElement[] = [
      { AttributeName: partitionKeyName.trim(), KeyType: "HASH" },
    ];

    if (sortKeyName && (VALID_KEY_TYPES as string[]).includes(sortKeyType)) {
      attributeDefinitions.push({
        AttributeName: sortKeyName,
        AttributeType: sortKeyType as KeyType,
      });
      keySchema.push({ AttributeName: sortKeyName, KeyType: "RANGE" });
    }

    await client.send(
      new CreateTableCommand({
        TableName: tableName,
        AttributeDefinitions: attributeDefinitions,
        KeySchema: keySchema,
        BillingMode: BillingMode.PAY_PER_REQUEST,
      }),
    );

    revalidatePath("/dynamodb", "layout");
    return { status: "success", data: undefined };
  } catch (err) {
    const { message } = toFriendlyError(err, dict.sdkErrors);
    return { status: "error", message };
  }
}
