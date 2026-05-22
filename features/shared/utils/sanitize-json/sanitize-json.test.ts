import { describe, expect, it } from "vitest";
import { sanitizeJson } from "./sanitize-json";

describe("sanitizeJson — valid JSON", () => {
  it("returns ok: true with parsed value for a valid JSON object", () => {
    const result = sanitizeJson('{"name":"Alice","age":30}');
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toEqual({ name: "Alice", age: 30 });
    }
  });

  it("returns ok: true for a valid JSON array", () => {
    const result = sanitizeJson('[1, 2, 3]');
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toEqual([1, 2, 3]);
    }
  });

  it("returns ok: true for a valid JSON primitive (string)", () => {
    const result = sanitizeJson('"hello"');
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe("hello");
    }
  });

  it("returns ok: true for a valid JSON primitive (number)", () => {
    const result = sanitizeJson('42');
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe(42);
    }
  });

  it("returns ok: true for null JSON", () => {
    const result = sanitizeJson('null');
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBeNull();
    }
  });
});

describe("sanitizeJson — invalid JSON", () => {
  it("returns ok: false with error INVALID_JSON for a malformed JSON string", () => {
    const result = sanitizeJson('{broken');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe("INVALID_JSON");
    }
  });

  it("returns ok: false with error INVALID_JSON for an empty string", () => {
    const result = sanitizeJson('');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe("INVALID_JSON");
    }
  });

  it("returns ok: false with error INVALID_JSON for plain text", () => {
    const result = sanitizeJson('not json at all');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe("INVALID_JSON");
    }
  });
});

describe("sanitizeJson — proto-pollution scrubbing", () => {
  it("scrubs __proto__ keys so Object.prototype is not polluted", () => {
    const input = '{"__proto__":{"polluted":true},"name":"Alice"}';
    const result = sanitizeJson(input);
    expect(result.ok).toBe(true);
    // Object.prototype must not have 'polluted' on it
    expect((Object.prototype as Record<string, unknown>)["polluted"]).toBeUndefined();
  });

  it("scrubs constructor.prototype injection attempts", () => {
    const input = '{"constructor":{"prototype":{"polluted":true}},"name":"Alice"}';
    const result = sanitizeJson(input);
    expect(result.ok).toBe(true);
    if (result.ok) {
      // The constructor key in the returned value should be a plain JSON value, not the Function constructor
      const value = result.value as Record<string, unknown>;
      // After round-trip, constructor should remain a plain object or be stripped
      // Key point: Object.prototype must NOT be polluted
      expect((Object.prototype as Record<string, unknown>)["polluted"]).toBeUndefined();
      expect(value["name"]).toBe("Alice");
    }
  });
});

describe("sanitizeJson — maxBytes size guard", () => {
  it("returns ok: false with error PAYLOAD_TOO_LARGE when input exceeds maxBytes", () => {
    const bigPayload = JSON.stringify({ data: "x".repeat(1000) });
    const result = sanitizeJson(bigPayload, { maxBytes: 100 });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe("PAYLOAD_TOO_LARGE");
    }
  });

  it("returns ok: true when input is exactly at the limit", () => {
    const input = '{"a":1}';
    // Buffer.byteLength('{"a":1}', 'utf8') = 7
    const result = sanitizeJson(input, { maxBytes: 7 });
    expect(result.ok).toBe(true);
  });

  it("returns ok: true when input is within the limit", () => {
    const input = '{"name":"Alice"}';
    const result = sanitizeJson(input, { maxBytes: 10000 });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toEqual({ name: "Alice" });
    }
  });

  it("returns ok: false when input is 1 byte over the limit", () => {
    const input = '{"a":1}';
    // byte length is 7, limit is 6 → too large
    const result = sanitizeJson(input, { maxBytes: 6 });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe("PAYLOAD_TOO_LARGE");
    }
  });

  it("does not apply size check when maxBytes is not provided", () => {
    // Valid small JSON should pass without maxBytes
    const result = sanitizeJson('{"name":"Alice"}');
    expect(result.ok).toBe(true);
  });

  it("size check occurs BEFORE parsing (invalid + too large returns PAYLOAD_TOO_LARGE)", () => {
    // Per design: size check first, then parse
    // So an invalid JSON that is also too large should return PAYLOAD_TOO_LARGE
    const invalidAndTooLarge = "{bad json " + "x".repeat(1000);
    const result = sanitizeJson(invalidAndTooLarge, { maxBytes: 10 });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe("PAYLOAD_TOO_LARGE");
    }
  });
});
