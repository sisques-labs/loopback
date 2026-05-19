import { describe, expect, it } from "vitest";

// ── Flat-key helpers ──────────────────────────────────────────────────────────

function flatKeys(obj: object, prefix = ""): string[] {
  return Object.entries(obj).flatMap(([k, v]) => {
    const key = prefix ? `${prefix}.${k}` : k;
    if (v !== null && typeof v === "object" && !Array.isArray(v)) {
      return flatKeys(v as object, key);
    }
    return [key];
  });
}

// ── S3 parity ────────────────────────────────────────────────────────────────

describe("i18n parity — s3", () => {
  it("every key in en.ts exists in es.ts", async () => {
    const { default: en } = await import("@/features/s3/i18n/en");
    const { default: es } = await import("@/features/s3/i18n/es");

    const enKeys = flatKeys(en);
    const esKeys = flatKeys(es);

    const missingInEs = enKeys.filter((k) => !esKeys.includes(k));
    expect(missingInEs).toEqual([]);
  });

  it("every key in es.ts exists in en.ts", async () => {
    const { default: en } = await import("@/features/s3/i18n/en");
    const { default: es } = await import("@/features/s3/i18n/es");

    const enKeys = flatKeys(en);
    const esKeys = flatKeys(es);

    const missingInEn = esKeys.filter((k) => !enKeys.includes(k));
    expect(missingInEn).toEqual([]);
  });
});

// ── SQS parity ───────────────────────────────────────────────────────────────

describe("i18n parity — sqs", () => {
  it("every key in en.ts exists in es.ts", async () => {
    const { default: en } = await import("@/features/sqs/i18n/en");
    const { default: es } = await import("@/features/sqs/i18n/es");

    const enKeys = flatKeys(en);
    const esKeys = flatKeys(es);

    const missingInEs = enKeys.filter((k) => !esKeys.includes(k));
    expect(missingInEs).toEqual([]);
  });

  it("every key in es.ts exists in en.ts", async () => {
    const { default: en } = await import("@/features/sqs/i18n/en");
    const { default: es } = await import("@/features/sqs/i18n/es");

    const enKeys = flatKeys(en);
    const esKeys = flatKeys(es);

    const missingInEn = esKeys.filter((k) => !enKeys.includes(k));
    expect(missingInEn).toEqual([]);
  });
});

// ── shared parity ─────────────────────────────────────────────────────────────

describe("i18n parity — shared", () => {
  it("every key in en.ts exists in es.ts", async () => {
    const { default: en } = await import("@/features/shared/i18n/en");
    const { default: es } = await import("@/features/shared/i18n/es");

    const enKeys = flatKeys(en);
    const esKeys = flatKeys(es);

    const missingInEs = enKeys.filter((k) => !esKeys.includes(k));
    expect(missingInEs).toEqual([]);
  });

  it("every key in es.ts exists in en.ts", async () => {
    const { default: en } = await import("@/features/shared/i18n/en");
    const { default: es } = await import("@/features/shared/i18n/es");

    const enKeys = flatKeys(en);
    const esKeys = flatKeys(es);

    const missingInEn = esKeys.filter((k) => !enKeys.includes(k));
    expect(missingInEn).toEqual([]);
  });
});
