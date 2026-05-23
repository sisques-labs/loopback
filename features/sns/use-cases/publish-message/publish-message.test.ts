import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/features/sns/lib/client", () => ({
  getSNSClient: vi.fn(),
}));

import { getSNSClient } from "@/features/sns/lib/client";
import { publishMessageAction } from "./publish-message";
import type { ActionState } from "@/features/shared/types/action-state";

function makeSnsClient(sendFn: (cmd: unknown) => Promise<unknown>) {
  return { send: sendFn } as unknown as Awaited<ReturnType<typeof getSNSClient>>;
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

describe("publishMessageAction — plain-string messages (existing behavior)", () => {
  it("accepts a plain string message and publishes it", async () => {
    vi.mocked(getSNSClient).mockResolvedValue(makeSnsClient(async () => ({})));

    const result = await publishMessageAction(
      idle,
      buildFormData({
        topicArn: "arn:aws:sns:us-east-1:000000000000:my-topic",
        message: "Hello, world!",
        locale: "en",
      }),
    );

    expect(result.status).toBe("success");
  });

  it("returns error when message is empty", async () => {
    const result = await publishMessageAction(
      idle,
      buildFormData({
        topicArn: "arn:aws:sns:us-east-1:000000000000:my-topic",
        message: "",
        locale: "en",
      }),
    );

    expect(result.status).toBe("error");
  });
});

describe("publishMessageAction — JSON validation", () => {
  it("returns error when message is invalid JSON (starts with {)", async () => {
    const result = await publishMessageAction(
      idle,
      buildFormData({
        topicArn: "arn:aws:sns:us-east-1:000000000000:my-topic",
        message: "{broken json",
        locale: "en",
      }),
    );

    expect(result.status).toBe("error");
    if (result.status === "error") {
      expect(result.message).toBeTruthy();
    }
  });

  it("returns error when message is invalid JSON (starts with [)", async () => {
    const result = await publishMessageAction(
      idle,
      buildFormData({
        topicArn: "arn:aws:sns:us-east-1:000000000000:my-topic",
        message: "[bad array",
        locale: "en",
      }),
    );

    expect(result.status).toBe("error");
  });

  it("accepts a valid JSON object message", async () => {
    vi.mocked(getSNSClient).mockResolvedValue(makeSnsClient(async () => ({})));

    const result = await publishMessageAction(
      idle,
      buildFormData({
        topicArn: "arn:aws:sns:us-east-1:000000000000:my-topic",
        message: '{"event":"order_placed","orderId":"123"}',
        locale: "en",
      }),
    );

    expect(result.status).toBe("success");
  });
});

describe("publishMessageAction — size validation (256 KB limit)", () => {
  it("returns error when message exceeds 256 KB", async () => {
    const bigMessage = "{" + '"data":"' + "x".repeat(270 * 1024) + '"}';

    const result = await publishMessageAction(
      idle,
      buildFormData({
        topicArn: "arn:aws:sns:us-east-1:000000000000:my-topic",
        message: bigMessage,
        locale: "en",
      }),
    );

    expect(result.status).toBe("error");
    if (result.status === "error") {
      expect(result.message).toBeTruthy();
    }
  });

  it("accepts a message within the 256 KB limit", async () => {
    vi.mocked(getSNSClient).mockResolvedValue(makeSnsClient(async () => ({})));

    const result = await publishMessageAction(
      idle,
      buildFormData({
        topicArn: "arn:aws:sns:us-east-1:000000000000:my-topic",
        message: '{"event":"test"}',
        locale: "en",
      }),
    );

    expect(result.status).toBe("success");
  });
});

describe("publishMessageAction — proto-pollution", () => {
  it("sanitizes __proto__ payload and still publishes", async () => {
    vi.mocked(getSNSClient).mockResolvedValue(makeSnsClient(async () => ({})));

    const result = await publishMessageAction(
      idle,
      buildFormData({
        topicArn: "arn:aws:sns:us-east-1:000000000000:my-topic",
        message: '{"__proto__":{"polluted":true},"event":"test"}',
        locale: "en",
      }),
    );

    // Should succeed — proto is scrubbed, not rejected
    expect(result.status).toBe("success");
    // Object.prototype must not be polluted
    expect((Object.prototype as Record<string, unknown>)["polluted"]).toBeUndefined();
  });
});
