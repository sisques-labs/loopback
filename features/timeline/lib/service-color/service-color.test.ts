import { describe, it, expect } from "vitest";
import { getServiceColorClasses } from "./service-color";

const KNOWN_SERVICES = ["lambda", "s3", "sns", "sqs", "dynamodb", "logs"] as const;

describe("getServiceColorClasses", () => {
  it.each(KNOWN_SERVICES)("returns non-empty badge and spine for known service: %s", (service) => {
    const result = getServiceColorClasses(service);
    expect(result.badge).toBeTruthy();
    expect(result.spine).toBeTruthy();
  });

  it("returns fallback (logs) classes for unknown service", () => {
    const unknown = getServiceColorClasses("unknown-service");
    const logs = getServiceColorClasses("logs");
    expect(unknown.badge).toBe(logs.badge);
    expect(unknown.spine).toBe(logs.spine);
  });

  it("is case-insensitive for known services", () => {
    const lower = getServiceColorClasses("lambda");
    const upper = getServiceColorClasses("LAMBDA");
    const mixed = getServiceColorClasses("Lambda");
    expect(upper.badge).toBe(lower.badge);
    expect(upper.spine).toBe(lower.spine);
    expect(mixed.badge).toBe(lower.badge);
    expect(mixed.spine).toBe(lower.spine);
  });

  it("badge and spine are non-empty strings for each known service", () => {
    for (const service of KNOWN_SERVICES) {
      const { badge, spine } = getServiceColorClasses(service);
      expect(typeof badge).toBe("string");
      expect(badge.length).toBeGreaterThan(0);
      expect(typeof spine).toBe("string");
      expect(spine.length).toBeGreaterThan(0);
    }
  });
});
