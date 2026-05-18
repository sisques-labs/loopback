import { describe, expect, it } from "vitest";
import type { LogEntry } from "./types";
import { ServiceCriteria } from "./service-criteria";

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

describe("ServiceCriteria", () => {
  it("matches an entry with the same service", () => {
    const criteria = new ServiceCriteria("lambda");
    expect(criteria.matches(makeEntry({ service: "lambda" }))).toBe(true);
  });

  it("does not match an entry with a different service", () => {
    const criteria = new ServiceCriteria("lambda");
    expect(criteria.matches(makeEntry({ service: "s3" }))).toBe(false);
  });

  it("is case-sensitive", () => {
    const criteria = new ServiceCriteria("lambda");
    expect(criteria.matches(makeEntry({ service: "Lambda" }))).toBe(false);
    expect(criteria.matches(makeEntry({ service: "LAMBDA" }))).toBe(false);
  });

  it("does not match an entry with unknown service when looking for lambda", () => {
    const criteria = new ServiceCriteria("lambda");
    expect(criteria.matches(makeEntry({ service: "unknown" }))).toBe(false);
  });
});
