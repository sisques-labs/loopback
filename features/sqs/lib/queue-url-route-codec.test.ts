import { describe, expect, it } from "vitest";
import { decodeQueueUrlParam, isLikelyQueueServiceUrl } from "@/features/sqs/lib/decode-queue-url-param";
import { encodeQueueUrlForRoute } from "@/features/sqs/lib/encode-queue-url-param";

describe("queue URL route codec", () => {
  const localstackStandard = "http://localhost:4566/000000000000/orders";
  const localstackFifo = "http://127.0.0.1:4566/000000000000/processing.fifo";

  it("round-trips LocalStack-style queue URLs", () => {
    for (const url of [localstackStandard, localstackFifo]) {
      const key = encodeQueueUrlForRoute(url);
      expect(key).toContain("http%3A%2F%2F");
      expect(decodeQueueUrlParam(key)).toBe(url);
    }
  });

  it("decodeQueueUrlParam tolerates already-decoded params", () => {
    expect(decodeQueueUrlParam(localstackStandard)).toBe(localstackStandard);
  });

  it("isLikelyQueueServiceUrl accepts http(s) URLs", () => {
    expect(isLikelyQueueServiceUrl(localstackStandard)).toBe(true);
    expect(isLikelyQueueServiceUrl("https://sqs.us-east-1.amazonaws.com/123/queue")).toBe(true);
  });

  it("isLikelyQueueServiceUrl rejects non-URLs", () => {
    expect(isLikelyQueueServiceUrl("%%%")).toBe(false);
    expect(isLikelyQueueServiceUrl("not-a-url")).toBe(false);
  });
});
