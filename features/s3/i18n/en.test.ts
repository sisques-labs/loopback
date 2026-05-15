import { describe, expect, it } from "vitest";
import en from "./en";

describe("S3 English copy", () => {
  it("ends rename success with a terminal period", () => {
    expect(en.renameObjectDialog.success.endsWith(".")).toBe(true);
  });

  it("provides a localized create-bucket name placeholder", () => {
    expect(en.createBucketDialog.namePlaceholder).toBe("my-bucket");
  });
});
