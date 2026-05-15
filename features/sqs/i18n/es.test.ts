import { describe, expect, it } from "vitest";
import es from "./es";

describe("SQS Spanish copy", () => {
  it("ends create-queue success with a terminal period", () => {
    expect(es.createQueueDialog.success.endsWith(".")).toBe(true);
  });

  it("provides localized queue name placeholders", () => {
    expect(es.createQueueDialog.namePlaceholder).toBe("mi-cola");
    expect(es.createQueueDialog.nameFifoPlaceholder).toContain("mi-cola");
  });
});
