import { describe, expect, it } from "vitest";
import { encodeScanStartKey, decodeScanStartKey } from "./route-codec";

describe("encodeScanStartKey", () => {
  it("returns null for undefined", () => {
    expect(encodeScanStartKey(undefined)).toBeNull();
  });

  it("encodes a key to a base64 string", () => {
    const key = { pk: { S: "user#1" } };
    const encoded = encodeScanStartKey(key);
    expect(typeof encoded).toBe("string");
    expect(encoded).not.toBeNull();
  });

  it("produces a valid base64 string", () => {
    const key = { pk: { S: "user#1" }, sk: { N: "42" } };
    const encoded = encodeScanStartKey(key)!;
    // should be decodeable as base64
    const decoded = Buffer.from(encoded, "base64").toString("utf8");
    expect(() => JSON.parse(decoded)).not.toThrow();
  });
});

describe("decodeScanStartKey", () => {
  it("returns undefined for null", () => {
    expect(decodeScanStartKey(null)).toBeUndefined();
  });

  it("returns undefined for undefined", () => {
    expect(decodeScanStartKey(undefined)).toBeUndefined();
  });

  it("returns undefined for empty string", () => {
    expect(decodeScanStartKey("")).toBeUndefined();
  });

  it("decodes a base64 string back to a key object", () => {
    const key = { pk: { S: "user#1" } };
    const encoded = encodeScanStartKey(key)!;
    const decoded = decodeScanStartKey(encoded);
    expect(decoded).toEqual(key);
  });

  it("returns undefined for invalid base64 JSON", () => {
    expect(decodeScanStartKey("not-valid-base64!!###")).toBeUndefined();
  });
});

describe("round-trip", () => {
  it("encodes then decodes to the same key", () => {
    const key = { pk: { S: "user#1" }, sk: { N: "42" } };
    const encoded = encodeScanStartKey(key)!;
    const decoded = decodeScanStartKey(encoded);
    expect(decoded).toEqual(key);
  });

  it("round-trips a complex key", () => {
    const key = {
      userId: { S: "abc-123" },
      timestamp: { N: "1715000000" },
    };
    const encoded = encodeScanStartKey(key)!;
    const decoded = decodeScanStartKey(encoded);
    expect(decoded).toEqual(key);
  });
});
