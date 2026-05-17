import { describe, expect, it } from "vitest";
import { toFriendlyError } from "./index";

const dict = {
  invalidParam: "Invalid queue parameter.",
  notFound: "The specified queue does not exist.",
  limitExceeded: "Queue limit exceeded for this account.",
  notAuthorized: "Not authorized to perform this SQS action.",
  endpointUnreachable: "Cannot connect to LocalStack at {endpoint}. Make sure it is running.",
  unknown: "An unexpected error occurred.",
  receiptHandleInvalid:
    "This message's visibility window expired — receive a new batch to retry.",
};

describe("toFriendlyError — ReceiptHandleIsInvalid", () => {
  it("returns code and localized message for ReceiptHandleIsInvalid", () => {
    const err = Object.assign(new Error("Receipt handle is invalid"), {
      name: "ReceiptHandleIsInvalid",
    });
    const result = toFriendlyError(err, dict);
    expect(result.code).toBe("ReceiptHandleIsInvalid");
    expect(result.message).toBe(dict.receiptHandleInvalid);
  });

  it("returns code and localized message for ReceiptHandleExpired", () => {
    const err = Object.assign(new Error("Receipt handle expired"), {
      name: "ReceiptHandleExpired",
    });
    const result = toFriendlyError(err, dict);
    expect(result.code).toBe("ReceiptHandleExpired");
    expect(result.message).toBe(dict.receiptHandleInvalid);
  });
});
