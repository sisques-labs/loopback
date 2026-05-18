import { describe, expect, it } from "vitest";
import type { LogEntry } from "./types";
import { buildCriteria } from "./build-criteria";

function makeEntry(overrides: Partial<LogEntry> = {}): LogEntry {
  return {
    id: "test-id",
    timestamp: 1700000000000,
    message: "Lambda function timed out",
    level: "error",
    logGroupName: "/aws/lambda/test",
    logStreamName: "stream-1",
    service: "lambda",
    ...overrides,
  };
}

describe("buildCriteria", () => {
  it("all-empty filters → match-all (AndCriteria with zero children)", () => {
    const criteria = buildCriteria({ service: "", level: "all", text: "" });
    expect(criteria.matches(makeEntry())).toBe(true);
    expect(
      criteria.matches(makeEntry({ service: "s3", level: "info", message: "anything" }))
    ).toBe(true);
  });

  it("service-only filter matches by service", () => {
    const criteria = buildCriteria({ service: "lambda", level: "all", text: "" });
    expect(criteria.matches(makeEntry({ service: "lambda" }))).toBe(true);
    expect(criteria.matches(makeEntry({ service: "s3" }))).toBe(false);
  });

  it("level-only filter matches by level", () => {
    const criteria = buildCriteria({ service: "", level: "error", text: "" });
    expect(criteria.matches(makeEntry({ level: "error" }))).toBe(true);
    expect(criteria.matches(makeEntry({ level: "info" }))).toBe(false);
  });

  it("text-only filter matches by message (case-insensitive)", () => {
    const criteria = buildCriteria({ service: "", level: "all", text: "timed out" });
    expect(criteria.matches(makeEntry())).toBe(true);
    expect(criteria.matches(makeEntry({ message: "everything is fine" }))).toBe(false);
  });

  it("service + level → entry with wrong level returns false", () => {
    const criteria = buildCriteria({ service: "lambda", level: "info", text: "" });
    const entry = makeEntry({ service: "lambda", level: "error" }); // service matches, level doesn't
    expect(criteria.matches(entry)).toBe(false);
  });

  it("all active filters must all match", () => {
    const criteria = buildCriteria({ service: "lambda", level: "error", text: "timed" });
    expect(criteria.matches(makeEntry())).toBe(true);
    expect(criteria.matches(makeEntry({ service: "s3" }))).toBe(false);
    expect(criteria.matches(makeEntry({ level: "info" }))).toBe(false);
    expect(criteria.matches(makeEntry({ message: "unrelated" }))).toBe(false);
  });

  it("level 'all' means no level filter is applied", () => {
    const criteria = buildCriteria({ service: "", level: "all", text: "" });
    expect(criteria.matches(makeEntry({ level: "info" }))).toBe(true);
    expect(criteria.matches(makeEntry({ level: "warn" }))).toBe(true);
    expect(criteria.matches(makeEntry({ level: "error" }))).toBe(true);
    expect(criteria.matches(makeEntry({ level: "unknown" }))).toBe(true);
  });

  it("whitespace-only text is treated as no-filter", () => {
    const criteria = buildCriteria({ service: "", level: "all", text: "   " });
    expect(criteria.matches(makeEntry())).toBe(true);
  });
});
