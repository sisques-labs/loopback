import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("@/features/lambda/lib/client", () => ({
  getLambdaClient: vi.fn(),
}));
vi.mock("@/features/lambda/lib/stub-zip", () => ({
  STUB_ZIP_BUFFER: Buffer.from("stub-zip"),
}));

import { CreateFunctionCommand, type LambdaClient } from "@aws-sdk/client-lambda";
import { getLambdaClient } from "@/features/lambda/lib/client";
import { seedLambda } from "./seed-lambda";
import type { LambdaResource } from "@/features/seed/presets/schema";

function makeLambdaClient(sendFn: (cmd: unknown) => Promise<unknown>): LambdaClient {
  return { send: sendFn } as unknown as LambdaClient;
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("seedLambda — happy path", () => {
  it("calls CreateFunctionCommand for each function and returns created names", async () => {
    const mockSend = vi.fn().mockResolvedValue({});
    vi.mocked(getLambdaClient).mockResolvedValue(makeLambdaClient(mockSend));

    const functions: LambdaResource[] = [
      {
        name: "loopback-ecommerce-processor",
        runtime: "nodejs20.x",
        handler: "index.handler",
        role: "arn:aws:iam::000000000000:role/lambda-role",
      },
    ];

    const result = await seedLambda(functions);

    expect(mockSend).toHaveBeenCalledTimes(1);
    const cmd = mockSend.mock.calls[0][0];
    expect(cmd).toBeInstanceOf(CreateFunctionCommand);
    expect(cmd.input.FunctionName).toBe("loopback-ecommerce-processor");
    expect(result.created).toContain("loopback-ecommerce-processor");
    expect(result.skipped).toHaveLength(0);
    expect(result.failed).toHaveLength(0);
  });

  it("uses STUB_ZIP_BUFFER for Code.ZipFile", async () => {
    const mockSend = vi.fn().mockResolvedValue({});
    vi.mocked(getLambdaClient).mockResolvedValue(makeLambdaClient(mockSend));

    await seedLambda([
      {
        name: "loopback-ecommerce-processor",
        runtime: "nodejs20.x",
        handler: "index.handler",
        role: "arn:aws:iam::000000000000:role/lambda-role",
      },
    ]);

    const cmd = mockSend.mock.calls[0][0];
    expect(cmd.input.Code).toEqual({ ZipFile: Buffer.from("stub-zip") });
  });
});

describe("seedLambda — idempotency", () => {
  it("records skipped when ResourceConflictException is thrown", async () => {
    const exists = Object.assign(new Error("already exists"), {
      name: "ResourceConflictException",
    });
    const mockSend = vi.fn().mockRejectedValueOnce(exists);
    vi.mocked(getLambdaClient).mockResolvedValue(makeLambdaClient(mockSend));

    const result = await seedLambda([
      {
        name: "loopback-ecommerce-processor",
        runtime: "nodejs20.x",
        handler: "index.handler",
        role: "arn:aws:iam::000000000000:role/lambda-role",
      },
    ]);

    expect(result.skipped).toContain("loopback-ecommerce-processor");
    expect(result.failed).toHaveLength(0);
  });
});

describe("seedLambda — partial failure", () => {
  it("records failed on unexpected errors, continues other functions", async () => {
    const mockSend = vi
      .fn()
      .mockRejectedValueOnce(new Error("network error"))
      .mockResolvedValueOnce({});
    vi.mocked(getLambdaClient).mockResolvedValue(makeLambdaClient(mockSend));

    const result = await seedLambda([
      {
        name: "loopback-event-consumer",
        runtime: "nodejs20.x",
        handler: "index.handler",
        role: "arn:aws:iam::000000000000:role/lambda-role",
      },
      {
        name: "loopback-event-router",
        runtime: "nodejs20.x",
        handler: "index.handler",
        role: "arn:aws:iam::000000000000:role/lambda-role",
      },
    ]);

    expect(result.failed).toContain("loopback-event-consumer");
    expect(result.created).toContain("loopback-event-router");
  });
});
