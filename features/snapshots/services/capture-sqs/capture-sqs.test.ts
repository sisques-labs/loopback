import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("server-only", () => ({}));

import {
  ListQueuesCommand,
  GetQueueAttributesCommand,
  type SQSClient,
} from "@aws-sdk/client-sqs";
import { captureSQS } from "./capture-sqs";

function makeClient(
  sendFn: (cmd: unknown) => Promise<unknown>,
): SQSClient {
  return { send: sendFn } as unknown as SQSClient;
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("captureSQS", () => {
  it("happy path — 2 queues with attributes", async () => {
    const client = makeClient(async (cmd) => {
      if (cmd instanceof ListQueuesCommand) {
        return {
          QueueUrls: [
            "http://localhost:4566/000000000000/orders",
            "http://localhost:4566/000000000000/notifications",
          ],
        };
      }
      if (cmd instanceof GetQueueAttributesCommand) {
        const input = (cmd as GetQueueAttributesCommand).input;
        if (input.QueueUrl?.includes("orders")) {
          return {
            Attributes: {
              VisibilityTimeout: "30",
              MessageRetentionPeriod: "345600",
              MaximumMessageSize: "262144",
              DelaySeconds: "0",
              ReceiveMessageWaitTimeSeconds: "0",
              ApproximateNumberOfMessages: "5",
              ApproximateNumberOfMessagesNotVisible: "2",
              ApproximateNumberOfMessagesDelayed: "0",
              CreatedTimestamp: "1716000000",
              LastModifiedTimestamp: "1716001000",
              QueueArn: "arn:aws:sqs:us-east-1:000000000000:orders",
            },
          };
        }
        return {
          Attributes: {
            VisibilityTimeout: "60",
            MessageRetentionPeriod: "86400",
            MaximumMessageSize: "262144",
            DelaySeconds: "5",
            ReceiveMessageWaitTimeSeconds: "20",
            ApproximateNumberOfMessages: "0",
            CreatedTimestamp: "1716000000",
            LastModifiedTimestamp: "1716001000",
            QueueArn: "arn:aws:sqs:us-east-1:000000000000:notifications",
          },
        };
      }
      throw new Error("Unexpected command");
    });

    const result = await captureSQS(client);

    expect(result).toHaveLength(2);
    const orders = result.find((q) => q.queueName === "orders");
    expect(orders).toBeDefined();
    expect(orders!.isFifo).toBe(false);
    expect(orders!.attributes.VisibilityTimeout).toBe("30");
    expect(orders!.attributes.MessageRetentionPeriod).toBe("345600");
  });

  it("no queues — returns empty array", async () => {
    const client = makeClient(async (cmd) => {
      if (cmd instanceof ListQueuesCommand) {
        return { QueueUrls: [] };
      }
      throw new Error("Unexpected command");
    });

    const result = await captureSQS(client);

    expect(result).toHaveLength(0);
  });

  it("strips volatile attributes", async () => {
    const client = makeClient(async (cmd) => {
      if (cmd instanceof ListQueuesCommand) {
        return {
          QueueUrls: ["http://localhost:4566/000000000000/my-queue"],
        };
      }
      if (cmd instanceof GetQueueAttributesCommand) {
        return {
          Attributes: {
            VisibilityTimeout: "30",
            MessageRetentionPeriod: "345600",
            MaximumMessageSize: "262144",
            DelaySeconds: "0",
            ReceiveMessageWaitTimeSeconds: "0",
            ApproximateNumberOfMessages: "99",
            ApproximateNumberOfMessagesNotVisible: "3",
            ApproximateNumberOfMessagesDelayed: "1",
            CreatedTimestamp: "1716000000",
            LastModifiedTimestamp: "1716001000",
            QueueArn: "arn:aws:sqs:us-east-1:000000000000:my-queue",
          },
        };
      }
      throw new Error("Unexpected command");
    });

    const result = await captureSQS(client);

    expect(result).toHaveLength(1);
    const attrs = result[0].attributes;
    // Volatile attrs must be stripped
    expect(attrs).not.toHaveProperty("ApproximateNumberOfMessages");
    expect(attrs).not.toHaveProperty("ApproximateNumberOfMessagesNotVisible");
    expect(attrs).not.toHaveProperty("ApproximateNumberOfMessagesDelayed");
    expect(attrs).not.toHaveProperty("CreatedTimestamp");
    expect(attrs).not.toHaveProperty("LastModifiedTimestamp");
    // QueueArn is captured (informational — stripped on restore)
    expect(attrs).toHaveProperty("QueueArn");
    // Non-volatile attrs must be kept
    expect(attrs.VisibilityTimeout).toBe("30");
    expect(attrs.MessageRetentionPeriod).toBe("345600");
  });

  it("FIFO queue — isFifo is true", async () => {
    const client = makeClient(async (cmd) => {
      if (cmd instanceof ListQueuesCommand) {
        return {
          QueueUrls: ["http://localhost:4566/000000000000/orders.fifo"],
        };
      }
      if (cmd instanceof GetQueueAttributesCommand) {
        return {
          Attributes: {
            VisibilityTimeout: "30",
            MessageRetentionPeriod: "345600",
            MaximumMessageSize: "262144",
            DelaySeconds: "0",
            ReceiveMessageWaitTimeSeconds: "0",
            FifoQueue: "true",
            ContentBasedDeduplication: "false",
          },
        };
      }
      throw new Error("Unexpected command");
    });

    const result = await captureSQS(client);

    expect(result).toHaveLength(1);
    expect(result[0].isFifo).toBe(true);
    expect(result[0].queueName).toBe("orders.fifo");
    expect(result[0].attributes.FifoQueue).toBe("true");
  });
});
