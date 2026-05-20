import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("@/features/sns/lib/client", () => ({
  getSNSClient: vi.fn(),
}));

import { CreateTopicCommand, type SNSClient } from "@aws-sdk/client-sns";
import { getSNSClient } from "@/features/sns/lib/client";
import { seedSNS } from "./seed-sns";
import type { SNSResource } from "@/features/seed/presets/schema";

function makeSNSClient(sendFn: (cmd: unknown) => Promise<unknown>): SNSClient {
  return { send: sendFn } as unknown as SNSClient;
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("seedSNS — happy path", () => {
  it("calls CreateTopicCommand for each topic and returns created names", async () => {
    const mockSend = vi.fn().mockResolvedValue({});
    vi.mocked(getSNSClient).mockResolvedValue(makeSNSClient(mockSend));

    const topics: SNSResource[] = [
      { name: "loopback-ecommerce-events" },
      { name: "loopback-event-fanout" },
    ];

    const result = await seedSNS(topics);

    expect(mockSend).toHaveBeenCalledTimes(2);
    const cmd = mockSend.mock.calls[0][0];
    expect(cmd).toBeInstanceOf(CreateTopicCommand);
    expect(cmd.input.Name).toBe("loopback-ecommerce-events");
    expect(result.created).toContain("loopback-ecommerce-events");
    expect(result.created).toContain("loopback-event-fanout");
    expect(result.skipped).toHaveLength(0);
    expect(result.failed).toHaveLength(0);
  });
});

describe("seedSNS — idempotency", () => {
  it("records skipped when topic already exists (SNS CreateTopic is idempotent — returns same ARN)", async () => {
    // SNS CreateTopic is idempotent natively; we treat TopicAlreadyExists as skipped for other SNS errors
    const exists = Object.assign(new Error("topic exists"), {
      name: "TopicAlreadyExists",
    });
    const mockSend = vi.fn().mockRejectedValueOnce(exists);
    vi.mocked(getSNSClient).mockResolvedValue(makeSNSClient(mockSend));

    const result = await seedSNS([{ name: "loopback-ecommerce-events" }]);

    expect(result.skipped).toContain("loopback-ecommerce-events");
    expect(result.failed).toHaveLength(0);
  });
});

describe("seedSNS — partial failure", () => {
  it("records failed on unexpected errors, continues other topics", async () => {
    const mockSend = vi
      .fn()
      .mockRejectedValueOnce(new Error("network error"))
      .mockResolvedValueOnce({});
    vi.mocked(getSNSClient).mockResolvedValue(makeSNSClient(mockSend));

    const result = await seedSNS([
      { name: "loopback-event-fanout" },
      { name: "loopback-event-alerts" },
    ]);

    expect(result.failed).toContain("loopback-event-fanout");
    expect(result.created).toContain("loopback-event-alerts");
  });
});
