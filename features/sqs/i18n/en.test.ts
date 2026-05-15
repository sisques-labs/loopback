import { describe, expect, it } from "vitest";
import en from "./en";

describe("SQS English copy", () => {
  it("ends create-queue success with a terminal period", () => {
    expect(en.createQueueDialog.success.endsWith(".")).toBe(true);
  });

  it("provides localized queue name placeholders", () => {
    expect(en.createQueueDialog.namePlaceholder).toBe("my-queue");
    expect(en.createQueueDialog.nameFifoPlaceholder).toContain("my-queue");
  });
});
