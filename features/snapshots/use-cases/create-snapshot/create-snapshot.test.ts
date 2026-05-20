import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

vi.mock(
  "@/features/snapshots/services/capture-dynamodb/capture-dynamodb",
  () => ({
    captureDynamoDB: vi.fn(),
  }),
);
vi.mock(
  "@/features/snapshots/services/capture-sqs/capture-sqs",
  () => ({
    captureSQS: vi.fn(),
  }),
);
vi.mock(
  "@/features/snapshots/services/capture-s3/capture-s3",
  () => ({
    captureS3: vi.fn(),
  }),
);

// Mock client factories
vi.mock("@/features/dynamodb/lib/client", () => ({
  getDynamoDBClient: vi.fn().mockResolvedValue({}),
}));
vi.mock("@/features/sqs/lib/client", () => ({
  getSQSClient: vi.fn().mockResolvedValue({}),
}));
vi.mock("@/lib/aws/client-factory", () => ({
  getS3Client: vi.fn().mockResolvedValue({}),
}));

import { captureDynamoDB } from "@/features/snapshots/services/capture-dynamodb/capture-dynamodb";
import { captureSQS } from "@/features/snapshots/services/capture-sqs/capture-sqs";
import { captureS3 } from "@/features/snapshots/services/capture-s3/capture-s3";
import { createSnapshotAction } from "./create-snapshot";
import type { ActionState } from "@/features/shared/types/action-state";
import type { SnapshotDocument } from "@/features/snapshots/lib/types/snapshot";

const IDLE: ActionState<SnapshotDocument> = { status: "idle" };
const EMPTY_FORM = new FormData();

function mockDynamoResult(tables = 0) {
  return { tables: Array.from({ length: tables }, (_, i) => ({ tableName: `Table${i}` })), warnings: [] };
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(captureDynamoDB).mockResolvedValue({ tables: [], warnings: [] });
  vi.mocked(captureSQS).mockResolvedValue([]);
  vi.mocked(captureS3).mockResolvedValue([]);
});

describe("createSnapshotAction — all services succeed", () => {
  it("returns success status with a valid SnapshotDocument", async () => {
    vi.mocked(captureDynamoDB).mockResolvedValue(mockDynamoResult(1));
    vi.mocked(captureSQS).mockResolvedValue([{ queueName: "orders", isFifo: false, attributes: {} }]);
    vi.mocked(captureS3).mockResolvedValue([{ bucketName: "assets", objects: [] }]);

    const result = await createSnapshotAction(IDLE, EMPTY_FORM);

    expect(result.status).toBe("success");
    if (result.status === "success") {
      expect(result.data.version).toBe("1");
      expect(result.data.createdAt).toBeTruthy();
      expect(result.data.dynamodb).toHaveLength(1);
      expect(result.data.sqs).toHaveLength(1);
      expect(result.data.s3).toHaveLength(1);
    }
  });

  it("createdAt is a valid ISO-8601 string", async () => {
    const result = await createSnapshotAction(IDLE, EMPTY_FORM);

    if (result.status === "success") {
      expect(() => new Date(result.data.createdAt)).not.toThrow();
      expect(new Date(result.data.createdAt).toISOString()).toBe(
        result.data.createdAt,
      );
    }
  });
});

describe("createSnapshotAction — one service fails (partial)", () => {
  it("returns success even when SQS capture throws", async () => {
    vi.mocked(captureDynamoDB).mockResolvedValue(mockDynamoResult(2));
    vi.mocked(captureSQS).mockRejectedValueOnce(new Error("SQS unavailable"));
    vi.mocked(captureS3).mockResolvedValue([{ bucketName: "bucket1", objects: [] }]);

    const result = await createSnapshotAction(IDLE, EMPTY_FORM);

    // Partial success: other services should still be included
    expect(result.status).toBe("success");
    if (result.status === "success") {
      expect(result.data.dynamodb).toHaveLength(2);
      expect(result.data.sqs).toHaveLength(0); // failed → empty
      expect(result.data.s3).toHaveLength(1);
    }
  });

  it("returns success when DynamoDB capture throws, sqs/s3 captured normally", async () => {
    vi.mocked(captureDynamoDB).mockRejectedValueOnce(new Error("DynamoDB down"));
    vi.mocked(captureSQS).mockResolvedValue([{ queueName: "q1", isFifo: false, attributes: {} }]);
    vi.mocked(captureS3).mockResolvedValue([{ bucketName: "b1", objects: [] }]);

    const result = await createSnapshotAction(IDLE, EMPTY_FORM);

    expect(result.status).toBe("success");
    if (result.status === "success") {
      expect(result.data.dynamodb).toHaveLength(0);
      expect(result.data.sqs).toHaveLength(1);
      expect(result.data.s3).toHaveLength(1);
    }
  });
});

describe("createSnapshotAction — all services fail", () => {
  it("returns error status when all three capture services fail", async () => {
    vi.mocked(captureDynamoDB).mockRejectedValueOnce(new Error("DynamoDB down"));
    vi.mocked(captureSQS).mockRejectedValueOnce(new Error("SQS down"));
    vi.mocked(captureS3).mockRejectedValueOnce(new Error("S3 down"));

    const result = await createSnapshotAction(IDLE, EMPTY_FORM);

    expect(result.status).toBe("error");
  });
});

describe("createSnapshotAction — revalidatePath", () => {
  it("calls revalidatePath('/snapshots') after a successful capture", async () => {
    const { revalidatePath } = await import("next/cache");

    await createSnapshotAction(IDLE, EMPTY_FORM);

    expect(revalidatePath).toHaveBeenCalledWith("/snapshots");
  });
});
