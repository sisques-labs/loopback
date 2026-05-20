import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

// Mock all reset helpers
vi.mock("@/features/seed/lib/reset-s3", () => ({
  resetS3: vi.fn(),
}));
vi.mock("@/features/seed/lib/reset-sqs", () => ({
  resetSQS: vi.fn(),
}));
vi.mock("@/features/seed/lib/reset-dynamodb", () => ({
  resetDynamoDB: vi.fn(),
}));
vi.mock("@/features/seed/lib/reset-lambda", () => ({
  resetLambda: vi.fn(),
}));
vi.mock("@/features/seed/lib/reset-sns", () => ({
  resetSNS: vi.fn(),
}));

import { resetS3 } from "@/features/seed/lib/reset-s3";
import { resetSQS } from "@/features/seed/lib/reset-sqs";
import { resetDynamoDB } from "@/features/seed/lib/reset-dynamodb";
import { resetLambda } from "@/features/seed/lib/reset-lambda";
import { resetSNS } from "@/features/seed/lib/reset-sns";
import { resetEnvironmentAction } from "./reset-environment";
import type { ActionState } from "@/features/shared/types/action-state";
import type { ResetReport } from "@/features/seed/types";

const IDLE: ActionState<ResetReport> = { status: "idle" };

function makeDeleteResult(names: string[]) {
  return { deleted: names, failed: [] };
}

beforeEach(() => {
  vi.clearAllMocks();
  // Default: return mock dry-run counts
  vi.mocked(resetS3).mockResolvedValue(2 as never);
  vi.mocked(resetSQS).mockResolvedValue(1 as never);
  vi.mocked(resetDynamoDB).mockResolvedValue(0 as never);
  vi.mocked(resetLambda).mockResolvedValue(0 as never);
  vi.mocked(resetSNS).mockResolvedValue(0 as never);
});

// ─── Dry-run ──────────────────────────────────────────────────────────────────

describe("resetEnvironmentAction — dry-run", () => {
  it("calls all helpers with dryRun: true and returns counts", async () => {
    const fd = new FormData();
    fd.set("dryRun", "true");

    const result = await resetEnvironmentAction(IDLE, fd);

    expect(resetS3).toHaveBeenCalledWith({ dryRun: true });
    expect(resetSQS).toHaveBeenCalledWith({ dryRun: true });
    expect(resetDynamoDB).toHaveBeenCalledWith({ dryRun: true });
    expect(resetLambda).toHaveBeenCalledWith({ dryRun: true });
    expect(resetSNS).toHaveBeenCalledWith({ dryRun: true });

    expect(result.status).toBe("success");
    if (result.status === "success") {
      expect(result.data.dryRun).toBe(true);
    }
  });

  it("dry-run returns resource counts per service without deleting", async () => {
    vi.mocked(resetS3).mockResolvedValue(2 as never);
    vi.mocked(resetSQS).mockResolvedValue(1 as never);
    vi.mocked(resetDynamoDB).mockResolvedValue(0 as never);
    vi.mocked(resetLambda).mockResolvedValue(0 as never);
    vi.mocked(resetSNS).mockResolvedValue(0 as never);

    const fd = new FormData();
    fd.set("dryRun", "true");

    const result = await resetEnvironmentAction(IDLE, fd);

    if (result.status === "success") {
      const s3 = result.data.results.find((r) => r.service === "s3");
      expect(s3?.created).toBe(2); // dry-run: count in "created" field
    }
  });

  it("dry-run does not call revalidatePath", async () => {
    const { revalidatePath } = await import("next/cache");

    const fd = new FormData();
    fd.set("dryRun", "true");

    await resetEnvironmentAction(IDLE, fd);

    expect(revalidatePath).not.toHaveBeenCalled();
  });
});

// ─── Execute mode ─────────────────────────────────────────────────────────────

describe("resetEnvironmentAction — execute mode", () => {
  beforeEach(() => {
    vi.mocked(resetS3).mockResolvedValue(makeDeleteResult(["bucket-a"]) as never);
    vi.mocked(resetSQS).mockResolvedValue(makeDeleteResult(["queue-a"]) as never);
    vi.mocked(resetDynamoDB).mockResolvedValue(makeDeleteResult(["table-a"]) as never);
    vi.mocked(resetLambda).mockResolvedValue(makeDeleteResult(["fn-a"]) as never);
    vi.mocked(resetSNS).mockResolvedValue(makeDeleteResult(["topic-a"]) as never);
  });

  it("calls all helpers with dryRun: false when dryRun param is 'false'", async () => {
    const fd = new FormData();
    fd.set("dryRun", "false");

    const result = await resetEnvironmentAction(IDLE, fd);

    expect(resetS3).toHaveBeenCalledWith({ dryRun: false });
    expect(resetSQS).toHaveBeenCalledWith({ dryRun: false });
    expect(resetDynamoDB).toHaveBeenCalledWith({ dryRun: false });
    expect(resetLambda).toHaveBeenCalledWith({ dryRun: false });
    expect(resetSNS).toHaveBeenCalledWith({ dryRun: false });

    expect(result.status).toBe("success");
    if (result.status === "success") {
      expect(result.data.dryRun).toBe(false);
    }
  });

  it("returns per-service results with deleted counts", async () => {
    const fd = new FormData();
    fd.set("dryRun", "false");

    const result = await resetEnvironmentAction(IDLE, fd);

    if (result.status === "success") {
      expect(result.data.results).toHaveLength(5);
      const s3 = result.data.results.find((r) => r.service === "s3");
      expect(s3?.created).toBe(1); // 1 deleted
    }
  });

  it("calls revalidatePath after execute", async () => {
    const { revalidatePath } = await import("next/cache");

    const fd = new FormData();
    fd.set("dryRun", "false");

    await resetEnvironmentAction(IDLE, fd);

    expect(revalidatePath).toHaveBeenCalled();
  });
});

// ─── Partial failure ──────────────────────────────────────────────────────────

describe("resetEnvironmentAction — partial failure tolerance", () => {
  it("returns success even when one helper throws, includes all 5 results", async () => {
    vi.mocked(resetS3).mockRejectedValueOnce(new Error("S3 down") as unknown as never);
    vi.mocked(resetSQS).mockResolvedValue(makeDeleteResult(["q1"]) as never);
    vi.mocked(resetDynamoDB).mockResolvedValue(makeDeleteResult([]) as never);
    vi.mocked(resetLambda).mockResolvedValue(makeDeleteResult([]) as never);
    vi.mocked(resetSNS).mockResolvedValue(makeDeleteResult([]) as never);

    const fd = new FormData();
    fd.set("dryRun", "false");

    const result = await resetEnvironmentAction(IDLE, fd);

    expect(result.status).toBe("success");
    if (result.status === "success") {
      expect(result.data.results).toHaveLength(5);
      const s3 = result.data.results.find((r) => r.service === "s3");
      expect(s3?.failed).toBeGreaterThan(0);
    }
  });
});
