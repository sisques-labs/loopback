import { describe, it, expect } from "vitest";
import { services } from "./services-registry";

describe("services-registry", () => {
  it("includes a cloudwatch-logs entry", () => {
    const entry = services.find((s) => s.slug === "cloudwatch-logs");
    expect(entry).toBeDefined();
  });

  it("cloudwatch-logs entry has the correct shape", () => {
    const entry = services.find((s) => s.slug === "cloudwatch-logs");
    expect(entry).toMatchObject({
      slug: "cloudwatch-logs",
      label: "CloudWatch Logs",
      href: "/cloudwatch-logs",
      status: "enabled",
    });
    expect(entry?.icon).toBeDefined();
  });
});
