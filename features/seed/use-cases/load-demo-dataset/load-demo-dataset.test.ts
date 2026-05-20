import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

// Mock per-service seed helpers
vi.mock("@/features/seed/lib/seed-s3/seed-s3", () => ({
  seedS3: vi.fn(),
}));
vi.mock("@/features/seed/lib/seed-sqs/seed-sqs", () => ({
  seedSQS: vi.fn(),
}));
vi.mock("@/features/seed/lib/seed-dynamodb/seed-dynamodb", () => ({
  seedDynamoDB: vi.fn(),
}));
vi.mock("@/features/seed/lib/seed-lambda/seed-lambda", () => ({
  seedLambda: vi.fn(),
}));
vi.mock("@/features/seed/lib/seed-sns/seed-sns", () => ({
  seedSNS: vi.fn(),
}));

import { seedS3 } from "@/features/seed/lib/seed-s3/seed-s3";
import { seedSQS } from "@/features/seed/lib/seed-sqs/seed-sqs";
import { seedDynamoDB } from "@/features/seed/lib/seed-dynamodb/seed-dynamodb";
import { seedLambda } from "@/features/seed/lib/seed-lambda/seed-lambda";
import { seedSNS } from "@/features/seed/lib/seed-sns/seed-sns";
import { loadDemoDatasetAction } from "./load-demo-dataset";
import type { ActionState } from "@/features/shared/types/action-state";
import type { LoadReport } from "@/features/seed/types";

const IDLE: ActionState<LoadReport> = { status: "idle" };

function makeSuccessResult(service: string) {
  return { created: [`${service}-resource`], skipped: [], failed: [] };
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(seedS3).mockResolvedValue(makeSuccessResult("s3"));
  vi.mocked(seedSQS).mockResolvedValue(makeSuccessResult("sqs"));
  vi.mocked(seedDynamoDB).mockResolvedValue(makeSuccessResult("dynamodb"));
  vi.mocked(seedLambda).mockResolvedValue(makeSuccessResult("lambda"));
  vi.mocked(seedSNS).mockResolvedValue(makeSuccessResult("sns"));
});

// ─── Unknown preset ───────────────────────────────────────────────────────────

describe("loadDemoDatasetAction — unknown preset", () => {
  it("returns error immediately without calling any AWS seeder", async () => {
    const fd = new FormData();
    fd.set("preset", "nonexistent");

    const result = await loadDemoDatasetAction(IDLE, fd);

    expect(result.status).toBe("error");
    if (result.status === "error") {
      expect(result.message).toMatch(/invalid preset/i);
    }
    expect(seedS3).not.toHaveBeenCalled();
    expect(seedSQS).not.toHaveBeenCalled();
    expect(seedDynamoDB).not.toHaveBeenCalled();
    expect(seedLambda).not.toHaveBeenCalled();
    expect(seedSNS).not.toHaveBeenCalled();
  });

  it("returns error when preset is missing", async () => {
    const fd = new FormData();
    const result = await loadDemoDatasetAction(IDLE, fd);
    expect(result.status).toBe("error");
  });
});

// ─── Full success ─────────────────────────────────────────────────────────────

describe("loadDemoDatasetAction — full success", () => {
  it("calls all 5 service seeders with correct preset data for ecommerce", async () => {
    const fd = new FormData();
    fd.set("preset", "ecommerce");

    const result = await loadDemoDatasetAction(IDLE, fd);

    expect(seedS3).toHaveBeenCalledOnce();
    expect(seedSQS).toHaveBeenCalledOnce();
    expect(seedDynamoDB).toHaveBeenCalledOnce();
    expect(seedLambda).toHaveBeenCalledOnce();
    expect(seedSNS).toHaveBeenCalledOnce();

    // Verify S3 was called with ecommerce buckets
    const s3Arg = vi.mocked(seedS3).mock.calls[0][0];
    expect(s3Arg.map((b: { name: string }) => b.name)).toContain("loopback-ecommerce-products");

    expect(result.status).toBe("success");
    if (result.status === "success") {
      expect(result.data.results).toHaveLength(5);
    }
  });

  it("calls all 5 service seeders for blog preset", async () => {
    const fd = new FormData();
    fd.set("preset", "blog");

    await loadDemoDatasetAction(IDLE, fd);

    const s3Arg = vi.mocked(seedS3).mock.calls[0][0];
    expect(s3Arg.map((b: { name: string }) => b.name)).toContain("loopback-blog-assets");
  });
});

// ─── Partial failure ──────────────────────────────────────────────────────────

describe("loadDemoDatasetAction — partial service failure", () => {
  it("returns success even when one service seeder fails, includes all 5 results", async () => {
    vi.mocked(seedSNS).mockRejectedValueOnce(new Error("SNS down"));

    const fd = new FormData();
    fd.set("preset", "ecommerce");

    const result = await loadDemoDatasetAction(IDLE, fd);

    // Overall status is still success (partial)
    expect(result.status).toBe("success");
    if (result.status === "success") {
      expect(result.data.results).toHaveLength(5);
      const snsResult = result.data.results.find((r) => r.service === "sns");
      // failed is a count (number)
      expect(snsResult?.failed).toBeGreaterThan(0);
    }
  });

  it("other services succeed even when SNS seeder throws", async () => {
    vi.mocked(seedSNS).mockRejectedValueOnce(new Error("SNS down"));

    const fd = new FormData();
    fd.set("preset", "ecommerce");

    const result = await loadDemoDatasetAction(IDLE, fd);

    if (result.status === "success") {
      const s3Result = result.data.results.find((r) => r.service === "s3");
      // created is a count (number)
      expect(s3Result?.created).toBeGreaterThan(0);
    }
  });
});

// ─── revalidatePath called ────────────────────────────────────────────────────

describe("loadDemoDatasetAction — revalidatePath", () => {
  it("calls revalidatePath after successful load", async () => {
    const { revalidatePath } = await import("next/cache");

    const fd = new FormData();
    fd.set("preset", "ecommerce");

    await loadDemoDatasetAction(IDLE, fd);

    expect(revalidatePath).toHaveBeenCalled();
  });
});
