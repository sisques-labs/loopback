"use server";
import "server-only";

import { getDynamoDBDocumentClient } from "@/features/dynamodb/lib/client";
import { toFriendlyError } from "@/features/dynamodb/lib/errors";
import { getDictionary } from "@/features/shared/i18n/get-dictionary";
import {
  DEFAULT_LOCALE,
  isLocale,
  type Locale,
} from "@/features/shared/i18n/locale";
import type { ActionState } from "@/features/shared/types/action-state";
import { chunk } from "@/features/shared/utils/chunk/chunk";
import { BatchWriteCommand } from "@aws-sdk/lib-dynamodb";
import { revalidatePath } from "next/cache";

export async function seedItemsAction(
  _prev: ActionState<{ written: number; failed: number }>,
  formData: FormData,
): Promise<ActionState<{ written: number; failed: number }>> {
  const tableName = (formData.get("tableName") as string | null) ?? "";
  const itemsJson = (formData.get("itemsJson") as string | null) ?? "";
  const localeRaw = (formData.get("locale") as string | null) ?? "";
  const locale: Locale = isLocale(localeRaw) ? localeRaw : DEFAULT_LOCALE;
  const dict = getDictionary(locale).dynamodb;

  // Validate: must be parseable JSON
  let items: unknown;
  try {
    items = JSON.parse(itemsJson);
  } catch {
    return { status: "error", message: dict.seedDialog.errorParseJson };
  }

  // Validate: must be an array
  if (!Array.isArray(items)) {
    return { status: "error", message: dict.seedDialog.errorParseJson };
  }

  // Validate: must be non-empty
  if (items.length === 0) {
    return { status: "error", message: dict.seedDialog.errorEmptyArray };
  }

  const total = items.length;
  let written = 0;
  let failed = 0;

  try {
    const client = getDynamoDBDocumentClient();
    const chunks = chunk(items as unknown[]);

    for (const chunkItems of chunks) {
      const requests = chunkItems.map((item) => ({
        PutRequest: { Item: item as Record<string, unknown> },
      }));

      const response = await client.send(
        new BatchWriteCommand({
          RequestItems: {
            [tableName]: requests,
          },
        }),
      );

      const unprocessed = response.UnprocessedItems?.[tableName] ?? [];

      if (unprocessed.length > 0) {
        // One retry pass for unprocessed items
        const retryResponse = await client.send(
          new BatchWriteCommand({
            RequestItems: {
              [tableName]: unprocessed,
            },
          }),
        );

        const stillUnprocessed =
          retryResponse.UnprocessedItems?.[tableName] ?? [];
        const chunkFailed = stillUnprocessed.length;
        const chunkWritten = chunkItems.length - chunkFailed;
        written += chunkWritten;
        failed += chunkFailed;
      } else {
        written += chunkItems.length;
      }
    }
  } catch (err) {
    const { message } = toFriendlyError(err, dict.sdkErrors);
    return { status: "error", message };
  }

  if (failed === 0) {
    revalidatePath(`/dynamodb/${tableName}`, "layout");
    return { status: "success", data: { written, failed } };
  }

  const message = dict.seedDialog.errorPartialFail
    .replace("{failed}", String(failed))
    .replace("{total}", String(total));

  return { status: "error", message };
}
