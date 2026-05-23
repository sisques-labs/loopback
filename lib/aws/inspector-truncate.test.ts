import { describe, it, expect } from "vitest";
import { truncate } from "./inspector-truncate";

const MAX_BYTES = 4 * 1024; // 4 KB

describe("truncate — primitives pass-through", () => {
  it("returns null as-is", () => {
    expect(truncate(null, MAX_BYTES)).toBeNull();
  });

  it("returns undefined as-is", () => {
    expect(truncate(undefined, MAX_BYTES)).toBeUndefined();
  });

  it("returns numbers as-is", () => {
    expect(truncate(42, MAX_BYTES)).toBe(42);
  });

  it("returns booleans as-is", () => {
    expect(truncate(true, MAX_BYTES)).toBe(true);
  });

  it("returns short strings as-is", () => {
    expect(truncate("hello", MAX_BYTES)).toBe("hello");
  });
});

describe("truncate — string >4KB", () => {
  it("replaces string longer than maxBytes with truncation marker", () => {
    const bigString = "x".repeat(MAX_BYTES + 1);
    const result = truncate(bigString, MAX_BYTES) as Record<string, unknown>;
    expect(result.__truncated).toBe(true);
    expect(typeof result.preview).toBe("string");
    expect((result.preview as string).length).toBe(100);
    expect(result.originalLength).toBe(bigString.length);
  });

  it("does NOT truncate a string equal to maxBytes", () => {
    const exactString = "x".repeat(MAX_BYTES);
    expect(truncate(exactString, MAX_BYTES)).toBe(exactString);
  });
});

describe("truncate — Uint8Array", () => {
  it("replaces Uint8Array with {__truncated, byteLength}", () => {
    const buf = new Uint8Array([1, 2, 3, 4]);
    const result = truncate(buf, MAX_BYTES) as Record<string, unknown>;
    expect(result.__truncated).toBe(true);
    expect(result.byteLength).toBe(4);
  });

  it("handles Uint8Array regardless of size", () => {
    const buf = new Uint8Array(1);
    const result = truncate(buf, MAX_BYTES) as Record<string, unknown>;
    expect(result.__truncated).toBe(true);
    expect(result.byteLength).toBe(1);
  });
});

describe("truncate — stream duck-type (transformToString)", () => {
  it("replaces objects with transformToString method with {__truncated, type: 'stream'}", () => {
    const fakeStream = {
      transformToString: () => Promise.resolve(""),
      other: "field",
    };
    const result = truncate(fakeStream, MAX_BYTES) as Record<string, unknown>;
    expect(result.__truncated).toBe(true);
    expect(result.type).toBe("stream");
  });
});

describe("truncate — nested objects", () => {
  it("recursively processes object values", () => {
    const bigString = "y".repeat(MAX_BYTES + 1);
    const obj = { nested: { value: bigString, normal: "ok" } };
    const result = truncate(obj, MAX_BYTES) as {
      nested: { value: Record<string, unknown>; normal: string };
    };
    expect(result.nested.value.__truncated).toBe(true);
    expect(result.nested.normal).toBe("ok");
  });

  it("recursively processes Uint8Array inside objects", () => {
    const buf = new Uint8Array([10, 20]);
    const obj = { Payload: buf };
    const result = truncate(obj, MAX_BYTES) as {
      Payload: Record<string, unknown>;
    };
    expect(result.Payload.__truncated).toBe(true);
    expect(result.Payload.byteLength).toBe(2);
  });

  it("passes through primitive object values unchanged", () => {
    const obj = { count: 5, enabled: false, name: "test" };
    const result = truncate(obj, MAX_BYTES) as typeof obj;
    expect(result.count).toBe(5);
    expect(result.enabled).toBe(false);
    expect(result.name).toBe("test");
  });

  it("processes arrays by mapping each element", () => {
    const arr = ["short", "y".repeat(MAX_BYTES + 1)];
    const result = truncate(arr, MAX_BYTES) as [string, Record<string, unknown>];
    expect(result[0]).toBe("short");
    expect(result[1].__truncated).toBe(true);
  });
});
