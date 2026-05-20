import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("@/features/sns/lib/client", () => ({
  getSNSClient: vi.fn(),
}));

import {
  ListTopicsCommand,
  DeleteTopicCommand,
  type SNSClient,
} from "@aws-sdk/client-sns";
import { getSNSClient } from "@/features/sns/lib/client";
import { resetSNS } from "./reset-sns";

function makeClient(sendFn: (cmd: unknown) => Promise<unknown>): SNSClient {
  return { send: sendFn } as unknown as SNSClient;
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("resetSNS — no topics", () => {
  it("returns empty arrays when there are no topics", async () => {
    const mockSend = vi.fn().mockImplementation((cmd: unknown) => {
      if (cmd instanceof ListTopicsCommand) return { Topics: [] };
      return {};
    });
    vi.mocked(getSNSClient).mockResolvedValue(makeClient(mockSend));

    const result = await resetSNS();

    expect(result.deleted).toHaveLength(0);
    expect(result.failed).toHaveLength(0);
  });
});

describe("resetSNS — happy path", () => {
  it("lists and deletes all topics", async () => {
    const mockSend = vi.fn().mockImplementation((cmd: unknown) => {
      if (cmd instanceof ListTopicsCommand) {
        return {
          Topics: [
            { TopicArn: "arn:aws:sns:us-east-1:000000000000:loopback-ecommerce-events" },
            { TopicArn: "arn:aws:sns:us-east-1:000000000000:loopback-blog-updates" },
          ],
        };
      }
      if (cmd instanceof DeleteTopicCommand) return {};
      return {};
    });
    vi.mocked(getSNSClient).mockResolvedValue(makeClient(mockSend));

    const result = await resetSNS();

    const deleteCount = mockSend.mock.calls.filter(
      ([cmd]) => cmd instanceof DeleteTopicCommand,
    ).length;
    expect(deleteCount).toBe(2);

    expect(result.deleted).toHaveLength(2);
    expect(result.failed).toHaveLength(0);
  });
});

describe("resetSNS — partial failure", () => {
  it("records failed topic on error, continues others", async () => {
    const mockSend = vi.fn().mockImplementation((cmd: unknown) => {
      if (cmd instanceof ListTopicsCommand) {
        return {
          Topics: [
            { TopicArn: "arn:aws:sns:us-east-1:000:ok-topic" },
            { TopicArn: "arn:aws:sns:us-east-1:000:fail-topic" },
          ],
        };
      }
      if (cmd instanceof DeleteTopicCommand) {
        const arn = (cmd as DeleteTopicCommand).input.TopicArn ?? "";
        if (arn.includes("fail-topic")) throw new Error("Denied");
        return {};
      }
      return {};
    });
    vi.mocked(getSNSClient).mockResolvedValue(makeClient(mockSend));

    const result = await resetSNS();

    expect(result.deleted).toHaveLength(1);
    expect(result.failed).toHaveLength(1);
  });
});

describe("resetSNS — dry-run", () => {
  it("returns topic count without deleting", async () => {
    const mockSend = vi.fn().mockImplementation((cmd: unknown) => {
      if (cmd instanceof ListTopicsCommand) {
        return {
          Topics: [
            { TopicArn: "arn:1" },
            { TopicArn: "arn:2" },
          ],
        };
      }
      return {};
    });
    vi.mocked(getSNSClient).mockResolvedValue(makeClient(mockSend));

    const count = await resetSNS({ dryRun: true });

    expect(count).toBe(2);
    const deleteCalls = mockSend.mock.calls.filter(
      ([cmd]) => cmd instanceof DeleteTopicCommand,
    );
    expect(deleteCalls).toHaveLength(0);
  });
});
