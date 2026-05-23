import { describe, it, expect } from "vitest";
import { mapTimeRangeToStartTime } from "./time-range";

const HOUR_MS = 60 * 60 * 1000;
const NOW = 1_700_000_000_000; // fixed epoch for determinism

describe("mapTimeRangeToStartTime", () => {
  it("1h returns now - 1 hour", () => {
    expect(mapTimeRangeToStartTime("1h", NOW)).toBe(NOW - 1 * HOUR_MS);
  });

  it("6h returns now - 6 hours", () => {
    expect(mapTimeRangeToStartTime("6h", NOW)).toBe(NOW - 6 * HOUR_MS);
  });

  it("24h returns now - 24 hours", () => {
    expect(mapTimeRangeToStartTime("24h", NOW)).toBe(NOW - 24 * HOUR_MS);
  });

  it("all returns 0", () => {
    expect(mapTimeRangeToStartTime("all", NOW)).toBe(0);
  });

  it("uses Date.now() when no now is provided (smoke test)", () => {
    const before = Date.now() - 1 * HOUR_MS;
    const result = mapTimeRangeToStartTime("1h");
    const after = Date.now() - 1 * HOUR_MS;
    expect(result).toBeGreaterThanOrEqual(before);
    expect(result).toBeLessThanOrEqual(after + 100); // 100ms tolerance
  });
});
