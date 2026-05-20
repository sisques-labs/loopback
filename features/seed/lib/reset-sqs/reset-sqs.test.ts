import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("@/features/sqs/lib/client", () => ({
  getSQSClient: vi.fn(),
}));

import {
  ListQueuesCommand,
  DeleteQueueCommand,
  type SQSClient,
} from "@aws-sdk/client-sqs";
import { getSQSClient } from "@/features/sqs/lib/client";
import { resetSQS } from "./reset-sqs";

function makeSQSClient(sendFn: (cmd: unknown) => Promise<unknown>): SQSClient {
  return { send: sendFn } as unknown as SQSClient;
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("resetSQS — no queues", () => {
  it("returns empty arrays when there are no queues", async () => {
    const mockSend = vi.fn().mockImplementation((cmd: unknown) => {
      if (cmd instanceof ListQueuesCommand) return { QueueUrls: [] };
      return {};
    });
    vi.mocked(getSQSClient).mockResolvedValue(makeSQSClient(mockSend));

    const result = await resetSQS();

    expect(result.deleted).toHaveLength(0);
    expect(result.failed).toHaveLength(0);
  });
});

describe("resetSQS — happy path", () => {
  it("lists and deletes all queues", async () => {
    const mockSend = vi.fn().mockImplementation((cmd: unknown) => {
      if (cmd instanceof ListQueuesCommand) {
        return { QueueUrls: ["http://localhost:4566/000000000000/queue-a", "http://localhost:4566/000000000000/queue-b"] };
      }
      if (cmd instanceof DeleteQueueCommand) return {};
      return {};
    });
    vi.mocked(getSQSClient).mockResolvedValue(makeSQSClient(mockSend));

    const result = await resetSQS();

    const deleteCallCount = mockSend.mock.calls.filter(
      ([cmd]) => cmd instanceof DeleteQueueCommand,
    ).length;
    expect(deleteCallCount).toBe(2);

    expect(result.deleted).toHaveLength(2);
    expect(result.failed).toHaveLength(0);
  });
});

describe("resetSQS — partial failure", () => {
  it("records failed queue on error, continues others", async () => {
    const urls = [
      "http://localhost:4566/000000000000/queue-ok",
      "http://localhost:4566/000000000000/queue-fail",
    ];
    const mockSend = vi.fn().mockImplementation((cmd: unknown) => {
      if (cmd instanceof ListQueuesCommand) return { QueueUrls: urls };
      if (cmd instanceof DeleteQueueCommand) {
        const url = (cmd as DeleteQueueCommand).input.QueueUrl ?? "";
        if (url.includes("queue-fail")) throw new Error("Denied");
        return {};
      }
      return {};
    });
    vi.mocked(getSQSClient).mockResolvedValue(makeSQSClient(mockSend));

    const result = await resetSQS();

    expect(result.deleted).toHaveLength(1);
    expect(result.failed).toHaveLength(1);
  });
});

describe("resetSQS — dry-run", () => {
  it("returns queue count without deleting", async () => {
    const mockSend = vi.fn().mockImplementation((cmd: unknown) => {
      if (cmd instanceof ListQueuesCommand) {
        return { QueueUrls: ["http://localhost/a", "http://localhost/b", "http://localhost/c"] };
      }
      return {};
    });
    vi.mocked(getSQSClient).mockResolvedValue(makeSQSClient(mockSend));

    const count = await resetSQS({ dryRun: true });

    expect(count).toBe(3);
    const deleteCalls = mockSend.mock.calls.filter(
      ([cmd]) => cmd instanceof DeleteQueueCommand,
    );
    expect(deleteCalls).toHaveLength(0);
  });
});
