/**
 * PR-3 RED: i18n parity tests.
 * These tests ensure:
 * 1. en.ts exports an object with all required keys
 * 2. es.ts has full key parity with en.ts
 * 3. No key returns undefined at runtime
 *
 * Written BEFORE en.ts / es.ts exist — intentionally failing.
 */
import { describe, it, expect } from "vitest";

// These imports will fail until en.ts / es.ts are created (RED phase)
import enDict from "./en";
import esDict from "./es";

const REQUIRED_KEYS = [
  "title",
  "description",
  "empty",
  "loading",
] as const;

const REQUIRED_TIME_RANGE_KEYS = [
  "label",
  "1h",
  "6h",
  "24h",
  "all",
] as const;

describe("Timeline i18n — en.ts", () => {
  it("exports a non-null object", () => {
    expect(enDict).toBeTruthy();
    expect(typeof enDict).toBe("object");
  });

  it.each(REQUIRED_KEYS)("has required top-level key: %s", (key) => {
    expect(enDict).toHaveProperty(key);
    expect((enDict as Record<string, unknown>)[key]).toBeTruthy();
  });

  it("has timeRange nested keys", () => {
    expect(enDict).toHaveProperty("timeRange");
    const tr = (enDict as Record<string, unknown>).timeRange as Record<string, unknown>;
    for (const k of REQUIRED_TIME_RANGE_KEYS) {
      expect(tr).toHaveProperty(k);
      expect(tr[k]).toBeTruthy();
    }
  });
});

describe("Timeline i18n — es.ts", () => {
  it("exports a non-null object", () => {
    expect(esDict).toBeTruthy();
    expect(typeof esDict).toBe("object");
  });

  it.each(REQUIRED_KEYS)("has required top-level key: %s", (key) => {
    expect(esDict).toHaveProperty(key);
    expect((esDict as Record<string, unknown>)[key]).toBeTruthy();
  });

  it("has timeRange nested keys", () => {
    expect(esDict).toHaveProperty("timeRange");
    const tr = (esDict as Record<string, unknown>).timeRange as Record<string, unknown>;
    for (const k of REQUIRED_TIME_RANGE_KEYS) {
      expect(tr).toHaveProperty(k);
      expect(tr[k]).toBeTruthy();
    }
  });

  it("has full key parity with en.ts", () => {
    // Both must have the same top-level keys
    const enKeys = Object.keys(enDict as object).sort();
    const esKeys = Object.keys(esDict as object).sort();
    expect(esKeys).toEqual(enKeys);
  });

  it("has full timeRange key parity with en.ts", () => {
    const enTR = (enDict as Record<string, unknown>).timeRange as Record<string, unknown>;
    const esTR = (esDict as Record<string, unknown>).timeRange as Record<string, unknown>;
    expect(Object.keys(esTR).sort()).toEqual(Object.keys(enTR).sort());
  });
});
