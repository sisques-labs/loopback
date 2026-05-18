import { describe, it, expect } from "vitest";
import en from "./en";
import es from "./es";

// ── helpers ─────────────────────────────────────────────────────────────────

/** Collect every leaf string value in a nested object. */
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

/** Collect all leaf keys as dot-separated paths. */
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

describe("logs/i18n — legal gate", () => {
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

describe("logs/i18n — en/es key parity", () => {
  it("es has exactly the same keys as en", () => {
    const enKeys = collectKeys(en).sort();
    const esKeys = collectKeys(es).sort();
    expect(esKeys).toEqual(enKeys);
  });
});

// ── REQUIRED KEYS ────────────────────────────────────────────────────────────

describe("logs/i18n/en — required keys present", () => {
  it("has title", () => expect(en.title).toBeTruthy());
  it("has description", () => expect(en.description).toBeTruthy());

  it("has filters.service", () => expect(en.filters.service).toBeTruthy());
  it("has filters.level", () => expect(en.filters.level).toBeTruthy());
  it("has filters.allServices", () => expect(en.filters.allServices).toBeTruthy());
  it("has filters.allLevels", () => expect(en.filters.allLevels).toBeTruthy());

  it("has search.placeholder", () => expect(en.search.placeholder).toBeTruthy());
  it("has search.label", () => expect(en.search.label).toBeTruthy());

  it("has entry.level.info", () => expect(en.entry.level.info).toBeTruthy());
  it("has entry.level.warn", () => expect(en.entry.level.warn).toBeTruthy());
  it("has entry.level.error", () => expect(en.entry.level.error).toBeTruthy());
  it("has entry.level.unknown", () => expect(en.entry.level.unknown).toBeTruthy());

  it("has status.idle", () => expect(en.status.idle).toBeTruthy());
  it("has status.polling", () => expect(en.status.polling).toBeTruthy());
  it("has status.error", () => expect(en.status.error).toBeTruthy());

  it("has autoScroll.enable", () => expect(en.autoScroll.enable).toBeTruthy());

  it("has empty", () => expect(en.empty).toBeTruthy());
  it("has noMatch", () => expect(en.noMatch).toBeTruthy());
  it("has updatedAt", () => expect(en.updatedAt).toBeTruthy());
  it("has errors.fetchFailed", () => expect(en.errors.fetchFailed).toBeTruthy());
  it("has actions.clearBuffer", () => expect(en.actions.clearBuffer).toBeTruthy());
});

describe("logs/i18n/es — required keys present", () => {
  it("has title", () => expect(es.title).toBeTruthy());
  it("has description", () => expect(es.description).toBeTruthy());

  it("has filters.service", () => expect(es.filters.service).toBeTruthy());
  it("has filters.level", () => expect(es.filters.level).toBeTruthy());
  it("has filters.allServices", () => expect(es.filters.allServices).toBeTruthy());
  it("has filters.allLevels", () => expect(es.filters.allLevels).toBeTruthy());

  it("has search.placeholder", () => expect(es.search.placeholder).toBeTruthy());
  it("has search.label", () => expect(es.search.label).toBeTruthy());

  it("has entry.level.info", () => expect(es.entry.level.info).toBeTruthy());
  it("has entry.level.warn", () => expect(es.entry.level.warn).toBeTruthy());
  it("has entry.level.error", () => expect(es.entry.level.error).toBeTruthy());
  it("has entry.level.unknown", () => expect(es.entry.level.unknown).toBeTruthy());

  it("has status.idle", () => expect(es.status.idle).toBeTruthy());
  it("has status.polling", () => expect(es.status.polling).toBeTruthy());
  it("has status.error", () => expect(es.status.error).toBeTruthy());

  it("has autoScroll.enable", () => expect(es.autoScroll.enable).toBeTruthy());

  it("has empty", () => expect(es.empty).toBeTruthy());
  it("has noMatch", () => expect(es.noMatch).toBeTruthy());
  it("has updatedAt", () => expect(es.updatedAt).toBeTruthy());
  it("has errors.fetchFailed", () => expect(es.errors.fetchFailed).toBeTruthy());
  it("has actions.clearBuffer", () => expect(es.actions.clearBuffer).toBeTruthy());
});
