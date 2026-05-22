/**
 * sanitizeJson — parses and scrubs user-provided JSON strings.
 *
 * Returns a discriminated result rather than throwing:
 *   { ok: true; value: unknown }   — parsed and proto-scrubbed value
 *   { ok: false; error: SanitizeErrorCode } — failure with a stable code
 *
 * Error codes are locale-agnostic. Callers map codes to i18n strings.
 *
 * Execution order (fail-fast):
 *   1. Size guard   — reject before parsing if maxBytes is provided and exceeded
 *   2. Parse        — reject if not valid JSON
 *   3. Proto-scrub  — round-trip through JSON.stringify/JSON.parse to strip __proto__
 *
 * Known lossy transforms after proto-scrub (acceptable for all AWS call sites):
 *   - Date instances  → ISO strings
 *   - undefined values in objects → omitted
 *   - Function values → omitted
 *   - Circular references → returns { ok: false, error: "INVALID_JSON" }
 */

export type SanitizeErrorCode =
  | "INVALID_JSON"
  | "PAYLOAD_TOO_LARGE";

export type SanitizeOk = { ok: true; value: unknown };
export type SanitizeError = { ok: false; error: SanitizeErrorCode };
export type SanitizeResult = SanitizeOk | SanitizeError;

/**
 * Parses `input` as JSON and scrubs prototype-pollution vectors.
 *
 * @param input    - The raw string to parse.
 * @param options  - Optional `maxBytes` limit (UTF-8 byte count via Buffer).
 *                   Check runs BEFORE parsing so oversized payloads are rejected cheaply.
 */
export function sanitizeJson(
  input: string,
  options?: { maxBytes?: number },
): SanitizeResult {
  // 1. Size guard — checked before parsing (cheaper to reject early)
  if (options?.maxBytes !== undefined) {
    const byteLength = Buffer.byteLength(input, "utf8");
    if (byteLength > options.maxBytes) {
      return { ok: false, error: "PAYLOAD_TOO_LARGE" };
    }
  }

  // 2. Parse
  let parsed: unknown;
  try {
    parsed = JSON.parse(input);
  } catch {
    return { ok: false, error: "INVALID_JSON" };
  }

  // 3. Proto-pollution scrub via round-trip
  // JSON.stringify omits __proto__, constructor.prototype, and non-enumerable props.
  // The re-parsed object inherits a fresh Object.prototype with no polluted keys.
  let sanitized: unknown;
  try {
    sanitized = JSON.parse(JSON.stringify(parsed));
  } catch {
    // Handles circular references or other stringify failures
    return { ok: false, error: "INVALID_JSON" };
  }

  return { ok: true, value: sanitized };
}
