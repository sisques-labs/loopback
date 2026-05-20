import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("server-only", () => ({}));

import {
  CreateQueueCommand,
  type SQSClient,
} from "@aws-sdk/client-sqs";
import { restoreSQS } from "./restore-sqs";
import type { SQSQueueSnapshot } from "@/features/snapshots/lib/types/snapshot";

function makeClient(
  sendFn: (cmd: unknown) => Promise<unknown>,
): SQSClient {
  return { send: sendFn } as unknown as SQSClient;
}

const QUEUE_SNAPSHOT: SQSQueueSnapshot = {
  queueName: "orders",
  isFifo: false,
  attributes: {
    VisibilityTimeout: "30",
    MessageRetentionPeriod: "86400",
    MaximumMessageSize: "262144",
    DelaySeconds: "0",
    ReceiveMessageWaitTimeSeconds: "0",
    // These volatile/endpoint-specific attrs should NOT be sent
    QueueArn: "arn:aws:sqs:us-east-1:000000000000:orders",
    ApproximateNumberOfMessages: "0",
    CreatedTimestamp: "1700000000",
    LastModifiedTimestamp: "1700000000",
  },
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("restoreSQS", () => {
  it("creates queue with only safe attributes (not QueueArn or volatile attrs)", async () => {
    let capturedCmd: CreateQueueCommand | undefined;
    const client = makeClient(async (cmd) => {
      if (cmd instanceof CreateQueueCommand) {
        capturedCmd = cmd;
        return { QueueUrl: "http://localhost:4566/000000000000/orders" };
      }
      throw new Error(`Unexpected: ${(cmd as { constructor: { name: string } }).constructor.name}`);
    });

    const report = await restoreSQS(client, [QUEUE_SNAPSHOT]);

    expect(report.service).toBe("sqs");
    expect(report.resources).toHaveLength(1);
    expect(report.resources[0].name).toBe("orders");
    expect(report.resources[0].status).toBe("created");

    expect(capturedCmd).toBeDefined();
    const attrs = capturedCmd!.input.Attributes ?? {};
    // Safe attrs are sent
    expect(attrs.VisibilityTimeout).toBe("30");
    expect(attrs.MessageRetentionPeriod).toBe("86400");
    // QueueArn must NOT be sent
    expect(attrs.QueueArn).toBeUndefined();
    // Volatile attrs must NOT be sent
    expect(attrs.ApproximateNumberOfMessages).toBeUndefined();
    expect(attrs.CreatedTimestamp).toBeUndefined();
    expect(attrs.LastModifiedTimestamp).toBeUndefined();
  });

  it("skips queue when QueueAlreadyExists error is thrown", async () => {
    const client = makeClient(async (cmd) => {
      if (cmd instanceof CreateQueueCommand) {
        const err = Object.assign(new Error("Queue already exists"), {
          name: "QueueAlreadyExists",
        });
        throw err;
      }
      throw new Error("Unexpected");
    });

    const report = await restoreSQS(client, [QUEUE_SNAPSHOT]);

    expect(report.resources[0].status).toBe("skipped");
    expect(report.resources[0].error).toBeUndefined();
  });

  it("returns empty resources when no queues provided", async () => {
    const client = makeClient(async () => ({}));
    const report = await restoreSQS(client, []);
    expect(report.service).toBe("sqs");
    expect(report.resources).toHaveLength(0);
  });
});
