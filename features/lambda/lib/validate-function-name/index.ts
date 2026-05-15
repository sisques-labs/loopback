const PATTERN = /^[a-zA-Z0-9-_]+$/;

export const FUNCTION_NAME_ERROR_CODES = [
  "required",
  "tooLong",        // > 64 chars
  "invalidPattern", // ![a-zA-Z0-9-_]
] as const;

export type FunctionNameErrorCode = (typeof FUNCTION_NAME_ERROR_CODES)[number];

/** Returns an error code or null when the name is valid. */
export function validateFunctionNameInput(raw: string): FunctionNameErrorCode | null {
  if (!raw || raw.trim().length === 0) return "required";
  const trimmed = raw.trim();
  if (trimmed.length > 64) return "tooLong";
  if (!PATTERN.test(trimmed)) return "invalidPattern";
  return null;
}
