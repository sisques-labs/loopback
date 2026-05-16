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

describe("SQS Spanish requeue i18n keys", () => {
  it("provides requeue key", () => {
    expect(es.queueDetail.receive.requeue.requeue).toBeTruthy();
  });

  it("provides requeueing key", () => {
    expect(es.queueDetail.receive.requeue.requeueing).toBeTruthy();
  });

  it("provides requeueSuccess key", () => {
    expect(es.queueDetail.receive.requeue.requeueSuccess).toBeTruthy();
  });

  it("provides sdkErrors.receiptHandleInvalid key", () => {
    expect(es.sdkErrors.receiptHandleInvalid).toBeTruthy();
  });
});
