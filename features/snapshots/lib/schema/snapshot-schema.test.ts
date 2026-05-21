import { describe, expect, it } from "vitest";
import { snapshotDocumentSchema } from "./snapshot-schema";

const validDoc = {
  version: "1",
  createdAt: "2024-01-15T10:30:00Z",
  endpoint: "http://localhost:4566",
  dynamodb: [],
  sqs: [],
  s3: [],
};

describe("snapshotDocumentSchema", () => {
  it("accepts a valid snapshot document", () => {
    const result = snapshotDocumentSchema.safeParse(validDoc);
    expect(result.success).toBe(true);
  });

  it("rejects a document missing the version field", () => {
    const { version: _, ...withoutVersion } = validDoc;
    const result = snapshotDocumentSchema.safeParse(withoutVersion);
    expect(result.success).toBe(false);
    if (!result.success) {
      const fields = result.error.issues.map((i) => i.path[0]);
      expect(fields).toContain("version");
    }
  });

  it("rejects non-object input (string)", () => {
    const result = snapshotDocumentSchema.safeParse("not-an-object");
    expect(result.success).toBe(false);
  });

  it("rejects non-object input (null)", () => {
    const result = snapshotDocumentSchema.safeParse(null);
    expect(result.success).toBe(false);
  });

  it("rejects non-object input (array)", () => {
    const result = snapshotDocumentSchema.safeParse([]);
    expect(result.success).toBe(false);
  });

  it("rejects a document with wrong version value", () => {
    const result = snapshotDocumentSchema.safeParse({ ...validDoc, version: "2" });
    expect(result.success).toBe(false);
  });

  it("rejects a document missing createdAt", () => {
    const { createdAt: _, ...withoutCreatedAt } = validDoc;
    const result = snapshotDocumentSchema.safeParse(withoutCreatedAt);
    expect(result.success).toBe(false);
  });

  it("rejects a document missing endpoint", () => {
    const { endpoint: _, ...withoutEndpoint } = validDoc;
    const result = snapshotDocumentSchema.safeParse(withoutEndpoint);
    expect(result.success).toBe(false);
  });

  it("rejects a document with dynamodb not being an array", () => {
    const result = snapshotDocumentSchema.safeParse({ ...validDoc, dynamodb: "not-array" });
    expect(result.success).toBe(false);
  });

  it("returns the parsed document on success", () => {
    const result = snapshotDocumentSchema.safeParse(validDoc);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.version).toBe("1");
      expect(result.data.endpoint).toBe("http://localhost:4566");
      expect(result.data.dynamodb).toEqual([]);
    }
  });
});
