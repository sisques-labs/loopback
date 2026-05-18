import { describe, expect, it } from "vitest";
import type { LogEntry } from "@/features/logs/lib/types/types";
import { AndCriteria } from "./and-criteria";
import { LevelCriteria } from "@/features/logs/lib/level-criteria/level-criteria";
import { ServiceCriteria } from "@/features/logs/lib/service-criteria/service-criteria";
import { TextCriteria } from "@/features/logs/lib/text-criteria/text-criteria";

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

describe("AndCriteria", () => {
  it("returns true for an empty array (pass-all)", () => {
    const criteria = new AndCriteria([]);
    expect(criteria.matches(makeEntry())).toBe(true);
  });

  it("returns the result of a single criterion when it matches", () => {
    const criteria = new AndCriteria([new ServiceCriteria("lambda")]);
    expect(criteria.matches(makeEntry({ service: "lambda" }))).toBe(true);
  });

  it("returns the result of a single criterion when it does not match", () => {
    const criteria = new AndCriteria([new ServiceCriteria("s3")]);
    expect(criteria.matches(makeEntry({ service: "lambda" }))).toBe(false);
  });

  it("returns true when all criteria match", () => {
    const criteria = new AndCriteria([
      new ServiceCriteria("lambda"),
      new LevelCriteria("error"),
      new TextCriteria("timed out"),
    ]);
    expect(criteria.matches(makeEntry())).toBe(true);
  });

  it("returns false when one criterion does not match", () => {
    const criteria = new AndCriteria([
      new ServiceCriteria("lambda"),
      new LevelCriteria("info"), // entry.level is "error"
    ]);
    expect(criteria.matches(makeEntry())).toBe(false);
  });

  it("returns false when all criteria fail", () => {
    const criteria = new AndCriteria([
      new ServiceCriteria("s3"),
      new LevelCriteria("warn"),
    ]);
    expect(criteria.matches(makeEntry())).toBe(false);
  });
});
