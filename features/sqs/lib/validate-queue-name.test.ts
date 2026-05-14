import { describe, expect, it } from "vitest";
import { finalQueueName, validateQueueNameInput } from "./validate-queue-name";

describe("validateQueueNameInput", () => {
  it("returns required for empty input", () => {
    expect(validateQueueNameInput("", false)).toBe("required");
    expect(validateQueueNameInput("   ", false)).toBe("required");
  });

  it("rejects .fifo suffix for standard queues", () => {
    expect(validateQueueNameInput("my-queue.fifo", false)).toBe("standardCannotEndFifo");
  });

  it("accepts valid standard name", () => {
    expect(validateQueueNameInput("my-queue", false)).toBeNull();
    expect(validateQueueNameInput("a", false)).toBeNull();
  });

  it("rejects standard invalid characters", () => {
    expect(validateQueueNameInput("bad:name", false)).toBe("standardInvalidPattern");
  });

  it("appends .fifo for FIFO and validates prefix", () => {
    expect(validateQueueNameInput("orders", true)).toBeNull();
    expect(finalQueueName("orders", true)).toBe("orders.fifo");
  });

  it("rejects FIFO when prefix empty after trim", () => {
    expect(validateQueueNameInput(".fifo", true)).toBe("fifoInvalidPrefix");
  });

  it("rejects name over 80 chars", () => {
    const long = "a".repeat(81);
    expect(validateQueueNameInput(long, false)).toBe("nameTooLong");
  });
});
