import { describe, expect, it, vi, beforeEach } from "vitest";

// Mock server-only so it doesn't throw in test environment
vi.mock("server-only", () => ({}));

// Mock all 5 list services
vi.mock("@/features/s3/services/list-buckets/list-buckets", () => ({
  listBuckets: vi.fn(),
}));
vi.mock("@/features/sqs/services/list-queues/list-queues", () => ({
  listQueues: vi.fn(),
}));
vi.mock("@/features/lambda/services/list-functions/list-functions", () => ({
  listFunctions: vi.fn(),
}));
vi.mock("@/features/sns/services/list-topics/list-topics", () => ({
  listTopics: vi.fn(),
}));
vi.mock("@/features/dynamodb/services/list-tables/list-tables", () => ({
  listTables: vi.fn(),
}));

// Mock encode helpers
vi.mock("@/features/sqs/lib/encode-queue-url-param", () => ({
  encodeQueueUrlForRoute: (url: string) => encodeURIComponent(url),
}));
vi.mock("@/features/lambda/lib/route-codec", () => ({
  encodeFunctionNameForRoute: (name: string) => encodeURIComponent(name),
}));

import { listBuckets } from "@/features/s3/services/list-buckets/list-buckets";
import { listQueues } from "@/features/sqs/services/list-queues/list-queues";
import { listFunctions } from "@/features/lambda/services/list-functions/list-functions";
import { listTopics } from "@/features/sns/services/list-topics/list-topics";
import { listTables } from "@/features/dynamodb/services/list-tables/list-tables";

const mockListBuckets = vi.mocked(listBuckets);
const mockListQueues = vi.mocked(listQueues);
const mockListFunctions = vi.mocked(listFunctions);
const mockListTopics = vi.mocked(listTopics);
const mockListTables = vi.mocked(listTables);

describe("searchResourcesAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default: all services return empty arrays
    mockListBuckets.mockResolvedValue([]);
    mockListQueues.mockResolvedValue([]);
    mockListFunctions.mockResolvedValue([]);
    mockListTopics.mockResolvedValue([]);
    mockListTables.mockResolvedValue([]);
  });

  it("fans out to all 5 services and returns normalized ResourceItem[]", async () => {
    mockListBuckets.mockResolvedValue([
      { name: "my-bucket", createdAt: "2024-01-01T00:00:00.000Z" },
    ]);
    mockListQueues.mockResolvedValue([
      { queueUrl: "http://localhost:4566/000000000000/my-queue", name: "my-queue", isFifo: false },
    ]);
    mockListFunctions.mockResolvedValue([
      {
        functionName: "my-function",
        functionArn: "arn:aws:lambda:us-east-1:000000000000:function:my-function",
        runtime: "nodejs18.x",
        handler: "index.handler",
        description: "",
        timeout: 3,
        memorySize: 128,
        lastModified: "2024-01-01T00:00:00.000Z",
        state: "Active",
      },
    ]);
    mockListTopics.mockResolvedValue([
      { arn: "arn:aws:sns:us-east-1:000000000000:my-topic", name: "my-topic", isFifo: false },
    ]);
    mockListTables.mockResolvedValue([
      {
        name: "my-table",
        status: "ACTIVE",
        itemCount: 0,
        tableSizeBytes: 0,
        partitionKeyName: "id",
        partitionKeyType: "S",
        billingMode: "PAY_PER_REQUEST",
        gsiCount: 0,
      },
    ]);

    const { searchResourcesAction } = await import("./search-resources");
    const result = await searchResourcesAction("/en");

    // Should include items from all 5 services
    expect(result).toHaveLength(5);

    const s3Item = result.find((r) => r.kind === "s3");
    expect(s3Item).toBeDefined();
    expect(s3Item?.label).toBe("my-bucket");
    expect(s3Item?.id).toContain("s3");
    expect(s3Item?.href).toContain("/en/s3/my-bucket");

    const sqsItem = result.find((r) => r.kind === "sqs");
    expect(sqsItem).toBeDefined();
    expect(sqsItem?.label).toBe("my-queue");
    expect(sqsItem?.href).toContain("/en/sqs/");

    const lambdaItem = result.find((r) => r.kind === "lambda");
    expect(lambdaItem).toBeDefined();
    expect(lambdaItem?.label).toBe("my-function");
    expect(lambdaItem?.href).toContain("/en/lambda/");

    const snsItem = result.find((r) => r.kind === "sns");
    expect(snsItem).toBeDefined();
    expect(snsItem?.label).toBe("my-topic");
    expect(snsItem?.href).toContain("/en/sns/");

    const dynamoItem = result.find((r) => r.kind === "dynamodb");
    expect(dynamoItem).toBeDefined();
    expect(dynamoItem?.label).toBe("my-table");
    expect(dynamoItem?.href).toContain("/en/dynamodb/");
  });

  it("returns [] when all services return empty arrays", async () => {
    const { searchResourcesAction } = await import("./search-resources");
    const result = await searchResourcesAction("/en");
    expect(result).toEqual([]);
    // All 5 services were called (no short-circuit on empty results)
    expect(mockListBuckets).toHaveBeenCalledOnce();
    expect(mockListQueues).toHaveBeenCalledOnce();
    expect(mockListFunctions).toHaveBeenCalledOnce();
    expect(mockListTopics).toHaveBeenCalledOnce();
    expect(mockListTables).toHaveBeenCalledOnce();
  });

  it("partial failure: one service rejects but others still return results", async () => {
    mockListBuckets.mockResolvedValue([
      { name: "surviving-bucket", createdAt: "2024-01-01T00:00:00.000Z" },
    ]);
    mockListQueues.mockResolvedValue([]);
    mockListFunctions.mockResolvedValue([]);
    mockListTopics.mockResolvedValue([]);
    mockListTables.mockRejectedValue(new Error("DynamoDB unavailable"));

    const { searchResourcesAction } = await import("./search-resources");
    const result = await searchResourcesAction("/en");

    // DynamoDB failed but S3 still returned its bucket
    const s3Item = result.find((r) => r.kind === "s3");
    expect(s3Item).toBeDefined();
    expect(s3Item?.label).toBe("surviving-bucket");

    // No DynamoDB items
    expect(result.find((r) => r.kind === "dynamodb")).toBeUndefined();
  });

  it("all services fail gracefully — returns []", async () => {
    mockListBuckets.mockRejectedValue(new Error("S3 down"));
    mockListQueues.mockRejectedValue(new Error("SQS down"));
    mockListFunctions.mockRejectedValue(new Error("Lambda down"));
    mockListTopics.mockRejectedValue(new Error("SNS down"));
    mockListTables.mockRejectedValue(new Error("DynamoDB down"));

    const { searchResourcesAction } = await import("./search-resources");
    const result = await searchResourcesAction("/en");
    expect(result).toEqual([]);
  });

  it("normalizes S3 bucket hrefs correctly: /{lang}/s3/{bucketName}", async () => {
    mockListBuckets.mockResolvedValue([
      { name: "test-bucket", createdAt: "2024-01-01T00:00:00.000Z" },
    ]);

    const { searchResourcesAction } = await import("./search-resources");
    const result = await searchResourcesAction("/en");
    const s3Item = result.find((r) => r.kind === "s3");
    expect(s3Item?.href).toBe("/en/s3/test-bucket");
  });

  it("normalizes SQS queue hrefs using encodeQueueUrlForRoute", async () => {
    const queueUrl = "http://localhost:4566/000000000000/test-queue";
    mockListQueues.mockResolvedValue([
      { queueUrl, name: "test-queue", isFifo: false },
    ]);

    const { searchResourcesAction } = await import("./search-resources");
    const result = await searchResourcesAction("/en");
    const sqsItem = result.find((r) => r.kind === "sqs");
    expect(sqsItem?.href).toBe(`/en/sqs/${encodeURIComponent(queueUrl)}`);
  });

  it("normalizes Lambda function hrefs using encodeFunctionNameForRoute", async () => {
    mockListFunctions.mockResolvedValue([
      {
        functionName: "my-fn",
        functionArn: "arn:aws:lambda:us-east-1:000000000000:function:my-fn",
        runtime: "nodejs18.x",
        handler: "index.handler",
        description: "",
        timeout: 3,
        memorySize: 128,
        lastModified: "2024-01-01T00:00:00.000Z",
        state: "Active",
      },
    ]);

    const { searchResourcesAction } = await import("./search-resources");
    const result = await searchResourcesAction("/en");
    const lambdaItem = result.find((r) => r.kind === "lambda");
    expect(lambdaItem?.href).toBe(`/en/lambda/${encodeURIComponent("my-fn")}`);
  });

  it("normalizes SNS topic hrefs using encodeURIComponent(arn)", async () => {
    const arn = "arn:aws:sns:us-east-1:000000000000:my-topic";
    mockListTopics.mockResolvedValue([
      { arn, name: "my-topic", isFifo: false },
    ]);

    const { searchResourcesAction } = await import("./search-resources");
    const result = await searchResourcesAction("/en");
    const snsItem = result.find((r) => r.kind === "sns");
    expect(snsItem?.href).toBe(`/en/sns/${encodeURIComponent(arn)}`);
  });

  it("normalizes DynamoDB table hrefs using encodeURIComponent(name)", async () => {
    mockListTables.mockResolvedValue([
      {
        name: "my-table",
        status: "ACTIVE",
        itemCount: 0,
        tableSizeBytes: 0,
        partitionKeyName: "id",
        partitionKeyType: "S",
        billingMode: "PAY_PER_REQUEST",
        gsiCount: 0,
      },
    ]);

    const { searchResourcesAction } = await import("./search-resources");
    const result = await searchResourcesAction("/en");
    const dynamoItem = result.find((r) => r.kind === "dynamodb");
    expect(dynamoItem?.href).toBe(`/en/dynamodb/${encodeURIComponent("my-table")}`);
  });
});
