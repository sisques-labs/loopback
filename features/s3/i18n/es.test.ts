import { describe, expect, it } from "vitest";
import es from "./es";

describe("S3 Spanish copy", () => {
  it("ends rename success with a terminal period", () => {
    expect(es.renameObjectDialog.success.endsWith(".")).toBe(true);
  });

  it("provides a localized create-bucket name placeholder", () => {
    expect(es.createBucketDialog.namePlaceholder).toBe("mi-bucket");
  });
});
