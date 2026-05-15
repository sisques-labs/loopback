import type { AttributeValue } from "@aws-sdk/client-dynamodb";

/**
 * Encode a DynamoDB ExclusiveStartKey to a URL-safe base64 string.
 * Returns null when no key is provided (first page).
 */
export function encodeScanStartKey(
  key: Record<string, AttributeValue> | undefined,
): string | null {
  if (!key) return null;
  try {
    const json = JSON.stringify(key);
    return Buffer.from(json, "utf8").toString("base64");
  } catch {
    return null;
  }
}

/**
 * Decode a base64 string back to a DynamoDB ExclusiveStartKey.
 * Returns undefined on null/empty/invalid input (first page or bad input).
 */
export function decodeScanStartKey(
  encoded: string | null | undefined,
): Record<string, AttributeValue> | undefined {
  if (!encoded) return undefined;
  try {
    const json = Buffer.from(encoded, "base64").toString("utf8");
    const parsed = JSON.parse(json);
    if (typeof parsed !== "object" || Array.isArray(parsed) || parsed === null) {
      return undefined;
    }
    return parsed as Record<string, AttributeValue>;
  } catch {
    return undefined;
  }
}
