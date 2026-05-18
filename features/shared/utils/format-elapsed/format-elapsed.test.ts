import { describe, expect, it } from "vitest";
import { formatElapsed } from "./format-elapsed";

describe("formatElapsed", () => {
  const now = 1_700_000_000_000;

  it("returns seconds when elapsed is under one minute", () => {
    expect(formatElapsed(now - 30_000, now)).toBe("30s");
    expect(formatElapsed(now - 59_000, now)).toBe("59s");
  });

  it("returns 0s when lastUpdatedAt equals now", () => {
    expect(formatElapsed(now, now)).toBe("0s");
  });

  it("returns minutes when elapsed is one minute or more", () => {
    expect(formatElapsed(now - 60_000, now)).toBe("1m");
    expect(formatElapsed(now - 125_000, now)).toBe("2m");
  });

  it("floors partial seconds and minutes", () => {
    expect(formatElapsed(now - 1_500, now)).toBe("1s");
    expect(formatElapsed(now - 89_999, now)).toBe("1m");
  });
});
