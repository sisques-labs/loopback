import { describe, expect, it } from "vitest";
import type { LogEntry, LogLevel } from "@/features/logs/lib/types/types";
import { LevelCriteria } from "./level-criteria";

function makeEntry(overrides: Partial<LogEntry> = {}): LogEntry {
  return {
    id: "test-id",
    timestamp: 1700000000000,
    message: "test message",
    level: "info",
    logGroupName: "/aws/lambda/test",
    logStreamName: "stream-1",
    service: "lambda",
    ...overrides,
  };
}

describe("LevelCriteria", () => {
  it("matches an entry with the same level", () => {
    const criteria = new LevelCriteria("info");
    expect(criteria.matches(makeEntry({ level: "info" }))).toBe(true);
  });

  it("does not match an entry with a different level", () => {
    const criteria = new LevelCriteria("info");
    expect(criteria.matches(makeEntry({ level: "error" }))).toBe(false);
  });

  it("matches warn level correctly", () => {
    const criteria = new LevelCriteria("warn");
    expect(criteria.matches(makeEntry({ level: "warn" }))).toBe(true);
    expect(criteria.matches(makeEntry({ level: "error" }))).toBe(false);
  });

  it("matches error level correctly", () => {
    const criteria = new LevelCriteria("error");
    expect(criteria.matches(makeEntry({ level: "error" }))).toBe(true);
    expect(criteria.matches(makeEntry({ level: "warn" }))).toBe(false);
  });

  it("matches unknown level correctly", () => {
    const criteria = new LevelCriteria("unknown");
    expect(criteria.matches(makeEntry({ level: "unknown" }))).toBe(true);
    expect(criteria.matches(makeEntry({ level: "info" }))).toBe(false);
  });

  const levels: LogLevel[] = ["info", "warn", "error", "unknown"];
  levels.forEach((level) => {
    it(`matches level ${level} against itself`, () => {
      const criteria = new LevelCriteria(level);
      expect(criteria.matches(makeEntry({ level }))).toBe(true);
    });
  });
});
