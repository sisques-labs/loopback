import { describe, expect, it } from "vitest";
import en from "./en";

describe("SNS English copy", () => {
  it("ends create-topic success with a terminal period", () => {
    expect(en.createTopicDialog.success.endsWith(".")).toBe(true);
  });

  it("provides localized topic name placeholders", () => {
    expect(en.createTopicDialog.namePlaceholder).toBe("my-topic");
    expect(en.createTopicDialog.nameFifoPlaceholder).toContain("my-topic");
  });
});
