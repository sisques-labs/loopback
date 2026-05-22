import { describe, it, expect } from "vitest";
import en from "./en";
import es from "./es";

// ── helpers ──────────────────────────────────────────────────────────────────

function collectStrings(obj: object, acc: string[] = []): string[] {
  for (const v of Object.values(obj)) {
    if (typeof v === "string") {
      acc.push(v);
    } else if (v !== null && typeof v === "object") {
      collectStrings(v as object, acc);
    }
  }
  return acc;
}

function collectKeys(obj: object, prefix = ""): string[] {
  const keys: string[] = [];
  for (const [k, v] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${k}` : k;
    if (v !== null && typeof v === "object") {
      keys.push(...collectKeys(v as object, path));
    } else {
      keys.push(path);
    }
  }
  return keys;
}

// ── LEGAL GATE ───────────────────────────────────────────────────────────────

const FORBIDDEN = ["localstack", "LocalStack", "local stack"];

describe("inspector/i18n — legal gate", () => {
  it("en.ts must not mention any forbidden product name", () => {
    const strings = collectStrings(en);
    for (const s of strings) {
      for (const f of FORBIDDEN) {
        expect(s.toLowerCase()).not.toContain(f.toLowerCase());
      }
    }
  });

  it("es.ts must not mention any forbidden product name", () => {
    const strings = collectStrings(es);
    for (const s of strings) {
      for (const f of FORBIDDEN) {
        expect(s.toLowerCase()).not.toContain(f.toLowerCase());
      }
    }
  });
});

// ── KEY PARITY ───────────────────────────────────────────────────────────────

describe("inspector/i18n — en/es key parity", () => {
  it("es has exactly the same keys as en", () => {
    const enKeys = collectKeys(en).sort();
    const esKeys = collectKeys(es).sort();
    expect(esKeys).toEqual(enKeys);
  });
});

// ── REQUIRED KEYS ────────────────────────────────────────────────────────────

describe("inspector/i18n/en — required keys present", () => {
  it("has title", () => expect(en.title).toBeTruthy());
  it("has description", () => expect(en.description).toBeTruthy());

  it("has toolbar.filters.service.label", () => expect(en.toolbar.filters.service.label).toBeTruthy());
  it("has toolbar.filters.service.all", () => expect(en.toolbar.filters.service.all).toBeTruthy());

  it("has toolbar.filters.status.label", () => expect(en.toolbar.filters.status.label).toBeTruthy());
  it("has toolbar.filters.status.all", () => expect(en.toolbar.filters.status.all).toBeTruthy());
  it("has toolbar.filters.status.success", () => expect(en.toolbar.filters.status.success).toBeTruthy());
  it("has toolbar.filters.status.error", () => expect(en.toolbar.filters.status.error).toBeTruthy());

  it("has toolbar.filters.text.placeholder", () => expect(en.toolbar.filters.text.placeholder).toBeTruthy());

  it("has toolbar.clearBuffer", () => expect(en.toolbar.clearBuffer).toBeTruthy());
  it("has toolbar.statusPolling", () => expect(en.toolbar.statusPolling).toBeTruthy());
  it("has toolbar.statusError", () => expect(en.toolbar.statusError).toBeTruthy());
  it("has toolbar.statusIdle", () => expect(en.toolbar.statusIdle).toBeTruthy());
  it("has toolbar.lastUpdated", () => expect(en.toolbar.lastUpdated).toBeTruthy());

  it("has empty.title", () => expect(en.empty.title).toBeTruthy());
  it("has empty.body", () => expect(en.empty.body).toBeTruthy());

  it("has card.duration", () => expect(en.card.duration).toBeTruthy());
  it("has card.attempts", () => expect(en.card.attempts).toBeTruthy());

  it("has detail.title", () => expect(en.detail.title).toBeTruthy());
  it("has detail.input", () => expect(en.detail.input).toBeTruthy());
  it("has detail.output", () => expect(en.detail.output).toBeTruthy());
  it("has detail.attempts", () => expect(en.detail.attempts).toBeTruthy());
  it("has detail.duration", () => expect(en.detail.duration).toBeTruthy());
  it("has detail.timestamp", () => expect(en.detail.timestamp).toBeTruthy());
  it("has detail.error", () => expect(en.detail.error).toBeTruthy());
  it("has detail.closeLabel", () => expect(en.detail.closeLabel).toBeTruthy());
});

describe("inspector/i18n/es — required keys present", () => {
  it("has title", () => expect(es.title).toBeTruthy());
  it("has description", () => expect(es.description).toBeTruthy());
});
