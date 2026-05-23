/**
 * Truncation utility for AWS SDK request/response payloads.
 * Replaces values that exceed maxBytes, binary blobs, and streams
 * with compact placeholder objects to keep ring-buffer entries lean.
 *
 * No "server-only" import — this is a pure utility, testable without Next.js.
 */

type TruncatedString = {
  __truncated: true;
  preview: string;
  originalLength: number;
};

type TruncatedBinary = {
  __truncated: true;
  byteLength: number;
};

type TruncatedStream = {
  __truncated: true;
  type: "stream";
};

/** Recursively sanitizes a value for safe storage in the ring buffer. */
export function truncate(value: unknown, maxBytes: number): unknown {
  // Primitives (null, undefined, number, boolean) pass through unchanged.
  if (value == null) return value;
  if (typeof value !== "object" && typeof value !== "string") return value;

  // Top-level string check.
  if (typeof value === "string") {
    return value.length > maxBytes
      ? ({ __truncated: true, preview: value.slice(0, 100), originalLength: value.length } satisfies TruncatedString)
      : value;
  }

  // Stream duck-type: objects with a `transformToString` method (AWS SDK streaming body).
  if (typeof (value as Record<string, unknown>).transformToString === "function") {
    return { __truncated: true, type: "stream" } satisfies TruncatedStream;
  }

  // Binary: Uint8Array / ArrayBuffer views.
  if (ArrayBuffer.isView(value)) {
    return { __truncated: true, byteLength: (value as Uint8Array).byteLength } satisfies TruncatedBinary;
  }

  // Arrays: map recursively.
  if (Array.isArray(value)) {
    return value.map((item) => truncate(item, maxBytes));
  }

  // Plain objects: process each value recursively.
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
    if (typeof v === "string" && v.length > maxBytes) {
      out[k] = { __truncated: true, preview: v.slice(0, 100), originalLength: v.length } satisfies TruncatedString;
    } else if (ArrayBuffer.isView(v)) {
      out[k] = { __truncated: true, byteLength: (v as Uint8Array).byteLength } satisfies TruncatedBinary;
    } else if (
      typeof v === "object" &&
      v !== null &&
      typeof (v as Record<string, unknown>).transformToString === "function"
    ) {
      out[k] = { __truncated: true, type: "stream" } satisfies TruncatedStream;
    } else if (typeof v === "object" && v !== null) {
      out[k] = truncate(v, maxBytes);
    } else {
      out[k] = v;
    }
  }
  return out;
}
