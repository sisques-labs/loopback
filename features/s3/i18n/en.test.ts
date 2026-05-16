import { describe, expect, it } from "vitest";
import en from "./en";

describe("S3 English copy", () => {
  it("ends rename success with a terminal period", () => {
    expect(en.renameObjectDialog.success.endsWith(".")).toBe(true);
  });

  it("provides a localized create-bucket name placeholder", () => {
    expect(en.createBucketDialog.namePlaceholder).toBe("my-bucket");
  });

  it("has objectRowActions.preview key", () => {
    expect(en.objectRowActions.preview).toBe("Preview");
  });

  it("has previewDialog.title key", () => {
    expect(en.previewDialog.title).toBe("Preview");
  });

  it("has previewDialog.loading key", () => {
    expect(en.previewDialog.loading).toBe("Loading preview…");
  });

  it("has previewDialog.unsupported key", () => {
    expect(en.previewDialog.unsupported).toBe("This file type can't be previewed.");
  });

  it("has previewDialog.tooLarge key", () => {
    expect(en.previewDialog.tooLarge).toBe("File too large to preview (max 1 MB).");
  });

  it("has previewDialog.downloadInstead key", () => {
    expect(en.previewDialog.downloadInstead).toBe("Download instead");
  });

  it("has previewDialog.error key", () => {
    expect(en.previewDialog.error).toBe("Couldn't load preview.");
  });
});
