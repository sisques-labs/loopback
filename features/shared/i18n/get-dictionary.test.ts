/**
 * PR-3 RED: getDictionary wiring test.
 * Ensures timeline is exposed under AppDict.timeline for both locales.
 */
import { describe, it, expect } from "vitest";
import { getDictionary } from "./get-dictionary";

describe("getDictionary — timeline wiring", () => {
  it("includes a timeline key in the English dictionary", () => {
    const dict = getDictionary("en");
    expect(dict).toHaveProperty("timeline");
    expect(dict.timeline).toBeTruthy();
  });

  it("includes a timeline key in the Spanish dictionary", () => {
    const dict = getDictionary("es");
    expect(dict).toHaveProperty("timeline");
    expect(dict.timeline).toBeTruthy();
  });

  it("timeline dict contains required keys for en", () => {
    const dict = getDictionary("en");
    const tl = dict.timeline as Record<string, unknown>;
    expect(tl).toHaveProperty("title");
    expect(tl).toHaveProperty("empty");
    expect(tl).toHaveProperty("loading");
    expect(tl).toHaveProperty("timeRange");
  });

  it("timeline dict contains required keys for es", () => {
    const dict = getDictionary("es");
    const tl = dict.timeline as Record<string, unknown>;
    expect(tl).toHaveProperty("title");
    expect(tl).toHaveProperty("empty");
    expect(tl).toHaveProperty("loading");
    expect(tl).toHaveProperty("timeRange");
  });

  it("timeline.timeRange has all required sub-keys for both locales", () => {
    const required = ["label", "1h", "6h", "24h", "all"];
    for (const locale of ["en", "es"] as const) {
      const dict = getDictionary(locale);
      const tr = (dict.timeline as Record<string, unknown>).timeRange as Record<string, unknown>;
      for (const k of required) {
        expect(tr, `${locale}.timeRange.${k}`).toHaveProperty(k);
      }
    }
  });
});
