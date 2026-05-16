import { describe, expect, it } from "vitest";
import en from "./en";
import es from "./es";

describe("SQS English copy", () => {
  it("ends create-queue success with a terminal period", () => {
    expect(en.createQueueDialog.success.endsWith(".")).toBe(true);
  });

  it("provides localized queue name placeholders", () => {
    expect(en.createQueueDialog.namePlaceholder).toBe("my-queue");
    expect(en.createQueueDialog.nameFifoPlaceholder).toContain("my-queue");
  });
});

describe("SQS English requeue i18n keys", () => {
  it("provides requeue key", () => {
    expect(en.queueDetail.receive.requeue.requeue).toBeTruthy();
  });

  it("provides requeueing key", () => {
    expect(en.queueDetail.receive.requeue.requeueing).toBeTruthy();
  });

  it("provides requeueSuccess key", () => {
    expect(en.queueDetail.receive.requeue.requeueSuccess).toBeTruthy();
  });

  it("provides sdkErrors.receiptHandleInvalid key", () => {
    expect(en.sdkErrors.receiptHandleInvalid).toBeTruthy();
  });
});

describe("SQS English validation i18n keys", () => {
  it("provides validation.receiptHandleRequired key", () => {
    expect(en.validation.receiptHandleRequired).toBeTruthy();
  });
});

describe("SQS i18n key-set parity (en vs es)", () => {
  it("queueDetail.receive.requeue has same keys in en and es", () => {
    expect(Object.keys(en.queueDetail.receive.requeue)).toEqual(
      Object.keys(es.queueDetail.receive.requeue),
    );
  });
});

describe("SQS send-message i18n keys", () => {
  it("provides invalidJson key", () => {
    expect(en.queueDetail.sendMessage.invalidJson).toBeTruthy();
  });

  it("provides formatButton key", () => {
    expect(en.queueDetail.sendMessage.formatButton).toBeTruthy();
  });
});

describe("SQS i18n sendMessage key-set parity (en vs es)", () => {
  it("queueDetail.sendMessage has same keys in en and es", () => {
    expect(Object.keys(en.queueDetail.sendMessage)).toEqual(
      Object.keys(es.queueDetail.sendMessage),
    );
  });
});
