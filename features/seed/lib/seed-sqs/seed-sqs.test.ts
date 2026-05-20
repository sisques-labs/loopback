import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("@/features/sqs/lib/client", () => ({
  getSQSClient: vi.fn(),
}));

import { CreateQueueCommand, type SQSClient } from "@aws-sdk/client-sqs";
import { getSQSClient } from "@/features/sqs/lib/client";
import { seedSQS } from "./seed-sqs";
import type { SQSResource } from "@/features/seed/presets/schema";

function makeSQSClient(sendFn: (cmd: unknown) => Promise<unknown>): SQSClient {
  return { send: sendFn } as unknown as SQSClient;
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("seedSQS — happy path", () => {
  it("calls CreateQueueCommand for each queue and returns created names", async () => {
    const mockSend = vi.fn().mockResolvedValue({});
    vi.mocked(getSQSClient).mockResolvedValue(makeSQSClient(mockSend));

    const queues: SQSResource[] = [
      { name: "loopback-ecommerce-orders" },
      { name: "loopback-ecommerce-notifications" },
    ];

    const result = await seedSQS(queues);

    expect(mockSend).toHaveBeenCalledTimes(2);
    const cmd = mockSend.mock.calls[0][0];
    expect(cmd).toBeInstanceOf(CreateQueueCommand);
    expect(result.created).toContain("loopback-ecommerce-orders");
    expect(result.created).toContain("loopback-ecommerce-notifications");
    expect(result.skipped).toHaveLength(0);
    expect(result.failed).toHaveLength(0);
  });
});

describe("seedSQS — idempotency", () => {
  it("records skipped when QueueAlreadyExists is thrown", async () => {
    const exists = Object.assign(new Error("queue exists"), {
      name: "QueueAlreadyExists",
    });
    const mockSend = vi.fn().mockRejectedValueOnce(exists);
    vi.mocked(getSQSClient).mockResolvedValue(makeSQSClient(mockSend));

    const result = await seedSQS([{ name: "loopback-ecommerce-orders" }]);

    expect(result.skipped).toContain("loopback-ecommerce-orders");
    expect(result.failed).toHaveLength(0);
  });
});

describe("seedSQS — partial failure", () => {
  it("records failed on unexpected errors, continues other queues", async () => {
    const mockSend = vi
      .fn()
      .mockRejectedValueOnce(new Error("network error"))
      .mockResolvedValueOnce({});
    vi.mocked(getSQSClient).mockResolvedValue(makeSQSClient(mockSend));

    const result = await seedSQS([
      { name: "loopback-ecommerce-orders" },
      { name: "loopback-ecommerce-notifications" },
    ]);

    expect(result.failed).toContain("loopback-ecommerce-orders");
    expect(result.created).toContain("loopback-ecommerce-notifications");
  });
});
