import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/features/sqs/lib/client", () => ({
  getSQSClient: vi.fn(),
}));

import { ChangeMessageVisibilityCommand, type SQSClient } from "@aws-sdk/client-sqs";
import { getSQSClient } from "@/features/sqs/lib/client";
import { requeueMessageAction } from "./requeue-message";
import type { ActionState } from "@/features/shared/types/action-state";
import en from "@/features/sqs/i18n/en";

function makeSqsClient(sendFn: (cmd: unknown) => Promise<unknown>): SQSClient {
  return { send: sendFn } as unknown as SQSClient;
}

function buildFormData(fields: Record<string, string>): FormData {
  const fd = new FormData();
  for (const [k, v] of Object.entries(fields)) {
    fd.append(k, v);
  }
  return fd;
}

const idle: ActionState = { status: "idle" };

beforeEach(() => {
  vi.clearAllMocks();
});

describe("requeueMessageAction — validation", () => {
  it("returns error and makes no AWS call when queueUrl is missing", async () => {
    const result = await requeueMessageAction(
      idle,
      buildFormData({ receiptHandle: "handle-abc", locale: "en" }),
    );
    expect(result.status).toBe("error");
    expect(vi.mocked(getSQSClient)).not.toHaveBeenCalled();
  });

  it("returns error and makes no AWS call when receiptHandle is missing", async () => {
    const result = await requeueMessageAction(
      idle,
      buildFormData({ queueUrl: "https://localhost/queue/test", locale: "en" }),
    );
    expect(result.status).toBe("error");
    if (result.status === "error") {
      expect(result.message).toBe(en.validation.receiptHandleRequired);
    }
    expect(vi.mocked(getSQSClient)).not.toHaveBeenCalled();
  });
});

describe("requeueMessageAction — success path", () => {
  it("calls ChangeMessageVisibilityCommand with VisibilityTimeout: 0 and the given ReceiptHandle", async () => {
    let capturedCommand: unknown;
    const client = makeSqsClient(async (cmd) => {
      capturedCommand = cmd;
      return {};
    });
    vi.mocked(getSQSClient).mockReturnValue(client);

    const queueUrl = "https://localhost/000000000000/test-queue";
    const receiptHandle = "receipt-handle-xyz";

    const result = await requeueMessageAction(
      idle,
      buildFormData({ queueUrl, receiptHandle, locale: "en" }),
    );

    expect(result.status).toBe("success");
    expect(capturedCommand).toBeInstanceOf(ChangeMessageVisibilityCommand);
    const input = (capturedCommand as ChangeMessageVisibilityCommand).input;
    expect(input.QueueUrl).toBe(queueUrl);
    expect(input.ReceiptHandle).toBe(receiptHandle);
    expect(input.VisibilityTimeout).toBe(0);
  });
});

describe("requeueMessageAction — AWS error", () => {
  it("returns error with localized message when AWS throws ReceiptHandleIsInvalid", async () => {
    const awsError = Object.assign(new Error("Handle invalid"), {
      name: "ReceiptHandleIsInvalid",
    });
    const client = makeSqsClient(async () => {
      throw awsError;
    });
    vi.mocked(getSQSClient).mockReturnValue(client);

    const result = await requeueMessageAction(
      idle,
      buildFormData({
        queueUrl: "https://localhost/000000000000/test-queue",
        receiptHandle: "stale-handle",
        locale: "en",
      }),
    );

    expect(result.status).toBe("error");
    if (result.status === "error") {
      expect(result.message).toBeTruthy();
      expect(result.message).not.toBe("Handle invalid");
    }
  });
});
