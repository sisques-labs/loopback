import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

vi.mock("@/features/snapshots/services/restore-dynamodb/restore-dynamodb", () => ({
  restoreDynamoDB: vi.fn(),
}));
vi.mock("@/features/snapshots/services/restore-sqs/restore-sqs", () => ({
  restoreSQS: vi.fn(),
}));
vi.mock("@/features/snapshots/services/restore-s3/restore-s3", () => ({
  restoreS3: vi.fn(),
}));

vi.mock("@/features/dynamodb/lib/client", () => ({
  getDynamoDBClient: vi.fn().mockResolvedValue({}),
  getDynamoDBDocumentClient: vi.fn().mockResolvedValue({}),
}));
vi.mock("@/features/sqs/lib/client", () => ({
  getSQSClient: vi.fn().mockResolvedValue({}),
}));
vi.mock("@/lib/aws/client-factory", () => ({
  getS3Client: vi.fn().mockResolvedValue({}),
}));

import { restoreDynamoDB } from "@/features/snapshots/services/restore-dynamodb/restore-dynamodb";
import { restoreSQS } from "@/features/snapshots/services/restore-sqs/restore-sqs";
import { restoreS3 } from "@/features/snapshots/services/restore-s3/restore-s3";
import { restoreSnapshotAction } from "./restore-snapshot";
import type { ActionState } from "@/features/shared/types/action-state";
import type { RestoreReport } from "@/features/snapshots/lib/types/snapshot";

const IDLE: ActionState<RestoreReport> = { status: "idle" };

const VALID_SNAPSHOT = {
  version: "1" as const,
  createdAt: new Date().toISOString(),
  endpoint: "http://localhost:4566",
  dynamodb: [],
  sqs: [],
  s3: [],
};

function makeFormData(snapshot?: unknown) {
  const fd = new FormData();
  if (snapshot !== undefined) {
    fd.set("snapshot", JSON.stringify(snapshot));
  }
  return fd;
}

const DDB_REPORT = {
  service: "dynamodb" as const,
  resources: [{ name: "Users", status: "created" as const }],
};
const SQS_REPORT = {
  service: "sqs" as const,
  resources: [],
};
const S3_REPORT = {
  service: "s3" as const,
  resources: [{ name: "assets", status: "created" as const }],
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(restoreDynamoDB).mockResolvedValue(DDB_REPORT);
  vi.mocked(restoreSQS).mockResolvedValue(SQS_REPORT);
  vi.mocked(restoreS3).mockResolvedValue(S3_REPORT);
});

describe("restoreSnapshotAction", () => {
  it("restores DDB → SQS → S3 sequentially and returns success with full report", async () => {
    const fd = makeFormData(VALID_SNAPSHOT);
    const result = await restoreSnapshotAction(IDLE, fd);

    expect(result.status).toBe("success");
    if (result.status === "success") {
      expect(result.data.services).toHaveLength(3);
      expect(result.data.services[0].service).toBe("dynamodb");
      expect(result.data.services[1].service).toBe("sqs");
      expect(result.data.services[2].service).toBe("s3");
    }

    // Verify sequential order via call order
    const ddbOrder = vi.mocked(restoreDynamoDB).mock.invocationCallOrder[0];
    const sqsOrder = vi.mocked(restoreSQS).mock.invocationCallOrder[0];
    const s3Order = vi.mocked(restoreS3).mock.invocationCallOrder[0];
    expect(ddbOrder).toBeLessThan(sqsOrder!);
    expect(sqsOrder).toBeLessThan(s3Order!);
  });

  it("returns error when no snapshot field in FormData", async () => {
    const fd = new FormData(); // no "snapshot" field
    const result = await restoreSnapshotAction(IDLE, fd);

    expect(result.status).toBe("error");
    expect(vi.mocked(restoreDynamoDB)).not.toHaveBeenCalled();
  });

  it("calls revalidatePath after successful restore", async () => {
    const { revalidatePath } = await import("next/cache");
    const fd = makeFormData(VALID_SNAPSHOT);

    await restoreSnapshotAction(IDLE, fd);

    expect(revalidatePath).toHaveBeenCalledWith("/", "layout");
  });

  it("returns error when snapshot JSON is invalid Zod schema", async () => {
    const invalid = { version: "2", createdAt: "bad", endpoint: "" }; // version "2" invalid
    const fd = makeFormData(invalid);
    const result = await restoreSnapshotAction(IDLE, fd);

    expect(result.status).toBe("error");
  });
});
