import { describe, expect, it } from "vitest";
import type { LogEntry } from "@/features/logs/lib/types/types";
import { TextCriteria } from "./text-criteria";

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

describe("TextCriteria", () => {
  it("matches when message contains the query string", () => {
    const criteria = new TextCriteria("timed out");
    expect(criteria.matches(makeEntry())).toBe(true);
  });

  it("does not match when message does not contain the query string", () => {
    const criteria = new TextCriteria("s3 error");
    expect(criteria.matches(makeEntry())).toBe(false);
  });

  it("is case-insensitive", () => {
    const criteria = new TextCriteria("TIMED OUT");
    expect(criteria.matches(makeEntry())).toBe(true);

    const criteriaLower = new TextCriteria("timed out");
    expect(
      criteriaLower.matches(makeEntry({ message: "Lambda function TIMED OUT" }))
    ).toBe(true);
  });

  it("empty string is pass-all (matches any entry)", () => {
    const criteria = new TextCriteria("");
    expect(criteria.matches(makeEntry())).toBe(true);
    expect(
      criteria.matches(makeEntry({ message: "completely different message" }))
    ).toBe(true);
  });

  it("whitespace-only string is pass-all", () => {
    const criteria = new TextCriteria("   ");
    expect(criteria.matches(makeEntry())).toBe(true);
    expect(
      criteria.matches(makeEntry({ message: "completely different message" }))
    ).toBe(true);
  });
});
