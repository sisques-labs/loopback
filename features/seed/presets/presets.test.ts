import { describe, expect, it } from "vitest";

// These imports will fail until the implementation files are created — that's the RED state.
import { isPresetSlug, PRESETS } from "./index";
import type { PresetSlug } from "./schema";

describe("isPresetSlug — valid slugs", () => {
  it("accepts 'ecommerce'", () => {
    expect(isPresetSlug("ecommerce")).toBe(true);
  });

  it("accepts 'blog'", () => {
    expect(isPresetSlug("blog")).toBe(true);
  });

  it("accepts 'event-driven'", () => {
    expect(isPresetSlug("event-driven")).toBe(true);
  });
});

describe("isPresetSlug — invalid slugs", () => {
  it("rejects an empty string", () => {
    expect(isPresetSlug("")).toBe(false);
  });

  it("rejects a random string", () => {
    expect(isPresetSlug("production")).toBe(false);
  });

  it("rejects null", () => {
    expect(isPresetSlug(null)).toBe(false);
  });

  it("rejects undefined", () => {
    expect(isPresetSlug(undefined)).toBe(false);
  });

  it("rejects a number", () => {
    expect(isPresetSlug(42)).toBe(false);
  });
});

describe("PRESETS — ecommerce resource name pattern", () => {
  it("all S3 bucket names match loopback-ecommerce-*", () => {
    const preset = PRESETS["ecommerce"];
    for (const bucket of preset.s3) {
      expect(bucket.name).toMatch(/^loopback-ecommerce-/);
    }
  });

  it("all SQS queue names match loopback-ecommerce-*", () => {
    const preset = PRESETS["ecommerce"];
    for (const queue of preset.sqs) {
      expect(queue.name).toMatch(/^loopback-ecommerce-/);
    }
  });

  it("all DynamoDB table names match loopback-ecommerce-*", () => {
    const preset = PRESETS["ecommerce"];
    for (const table of preset.dynamodb) {
      expect(table.name).toMatch(/^loopback-ecommerce-/);
    }
  });

  it("all Lambda function names match loopback-ecommerce-*", () => {
    const preset = PRESETS["ecommerce"];
    for (const fn of preset.lambda) {
      expect(fn.name).toMatch(/^loopback-ecommerce-/);
    }
  });

  it("all SNS topic names match loopback-ecommerce-*", () => {
    const preset = PRESETS["ecommerce"];
    for (const topic of preset.sns) {
      expect(topic.name).toMatch(/^loopback-ecommerce-/);
    }
  });

  it("has the expected S3 buckets", () => {
    const names = PRESETS["ecommerce"].s3.map((b) => b.name);
    expect(names).toContain("loopback-ecommerce-products");
    expect(names).toContain("loopback-ecommerce-media");
  });

  it("has the expected SQS queues", () => {
    const names = PRESETS["ecommerce"].sqs.map((q) => q.name);
    expect(names).toContain("loopback-ecommerce-orders");
    expect(names).toContain("loopback-ecommerce-notifications");
  });

  it("has the expected DynamoDB tables", () => {
    const names = PRESETS["ecommerce"].dynamodb.map((t) => t.name);
    expect(names).toContain("loopback-ecommerce-catalog");
    expect(names).toContain("loopback-ecommerce-users");
  });

  it("has the expected Lambda function", () => {
    const names = PRESETS["ecommerce"].lambda.map((f) => f.name);
    expect(names).toContain("loopback-ecommerce-processor");
  });

  it("has the expected SNS topic", () => {
    const names = PRESETS["ecommerce"].sns.map((t) => t.name);
    expect(names).toContain("loopback-ecommerce-events");
  });
});

describe("PRESETS — blog resource name pattern", () => {
  it("all resource names match loopback-blog-*", () => {
    const preset = PRESETS["blog"];
    const allNames = [
      ...preset.s3.map((b) => b.name),
      ...preset.sqs.map((q) => q.name),
      ...preset.dynamodb.map((t) => t.name),
      ...preset.lambda.map((f) => f.name),
      ...preset.sns.map((t) => t.name),
    ];
    for (const name of allNames) {
      expect(name).toMatch(/^loopback-blog-/);
    }
  });

  it("has expected blog resources", () => {
    const preset = PRESETS["blog"];
    expect(preset.s3.map((b) => b.name)).toContain("loopback-blog-assets");
    expect(preset.sqs.map((q) => q.name)).toContain("loopback-blog-comments");
    expect(preset.dynamodb.map((t) => t.name)).toContain("loopback-blog-posts");
    expect(preset.dynamodb.map((t) => t.name)).toContain("loopback-blog-authors");
    expect(preset.lambda.map((f) => f.name)).toContain("loopback-blog-publisher");
    expect(preset.sns.map((t) => t.name)).toContain("loopback-blog-updates");
  });
});

describe("PRESETS — event-driven resource name pattern", () => {
  it("all resource names match loopback-event-*", () => {
    const preset = PRESETS["event-driven"];
    const allNames = [
      ...preset.s3.map((b) => b.name),
      ...preset.sqs.map((q) => q.name),
      ...preset.dynamodb.map((t) => t.name),
      ...preset.lambda.map((f) => f.name),
      ...preset.sns.map((t) => t.name),
    ];
    for (const name of allNames) {
      expect(name).toMatch(/^loopback-event-/);
    }
  });

  it("has expected event-driven resources", () => {
    const preset = PRESETS["event-driven"];
    expect(preset.sqs.map((q) => q.name)).toContain("loopback-event-ingestion");
    expect(preset.sqs.map((q) => q.name)).toContain("loopback-event-dlq");
    expect(preset.dynamodb.map((t) => t.name)).toContain("loopback-event-store");
    expect(preset.lambda.map((f) => f.name)).toContain("loopback-event-consumer");
    expect(preset.lambda.map((f) => f.name)).toContain("loopback-event-router");
    expect(preset.sns.map((t) => t.name)).toContain("loopback-event-fanout");
    expect(preset.sns.map((t) => t.name)).toContain("loopback-event-alerts");
  });
});

describe("PRESETS — preset slug field", () => {
  it("each PRESET entry has a slug field matching its key", () => {
    const slugs: PresetSlug[] = ["ecommerce", "blog", "event-driven"];
    for (const slug of slugs) {
      expect(PRESETS[slug].slug).toBe(slug);
    }
  });
});

describe("PRESETS — name and description fields", () => {
  it("each PRESET entry has a non-empty name string", () => {
    const slugs: PresetSlug[] = ["ecommerce", "blog", "event-driven"];
    for (const slug of slugs) {
      expect(typeof PRESETS[slug].name).toBe("string");
      expect(PRESETS[slug].name.length).toBeGreaterThan(0);
    }
  });

  it("each PRESET entry has a non-empty description string", () => {
    const slugs: PresetSlug[] = ["ecommerce", "blog", "event-driven"];
    for (const slug of slugs) {
      expect(typeof PRESETS[slug].description).toBe("string");
      expect(PRESETS[slug].description.length).toBeGreaterThan(0);
    }
  });

  it("ecommerce preset has correct name and description", () => {
    expect(PRESETS["ecommerce"].name).toBe("E-Commerce");
    expect(PRESETS["ecommerce"].description).toBe(
      "Products catalog, orders queue, inventory table, and fulfillment function",
    );
  });

  it("blog preset has correct name and description", () => {
    expect(PRESETS["blog"].name).toBe("Blog");
    expect(PRESETS["blog"].description).toBe(
      "Content bucket, posts table, notifications topic, and publishing function",
    );
  });

  it("event-driven preset has correct name and description", () => {
    expect(PRESETS["event-driven"].name).toBe("Event-Driven");
    expect(PRESETS["event-driven"].description).toBe(
      "Event bus queues, routing topics, and processor functions",
    );
  });
});
