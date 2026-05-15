import { describe, expect, it } from "vitest";
import es from "./es";

describe("SNS Spanish copy", () => {
  it("ends create-topic success with a terminal period", () => {
    expect(es.createTopicDialog.success.endsWith(".")).toBe(true);
  });

  it("provides localized topic name placeholders", () => {
    expect(es.createTopicDialog.namePlaceholder).toBe("mi-topic");
    expect(es.createTopicDialog.nameFifoPlaceholder).toContain("mi-topic");
  });
});
