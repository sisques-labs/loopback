import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("@/features/lambda/lib/client", () => ({
  getLambdaClient: vi.fn(),
}));

import { DeleteFunctionCommand, type LambdaClient } from "@aws-sdk/client-lambda";
import { getLambdaClient } from "@/features/lambda/lib/client";
import { deleteFunction } from "./delete-function";

// ─── helpers ────────────────────────────────────────────────────────────────

function makeLambdaClient(sendFn: (cmd: unknown) => Promise<unknown>): LambdaClient {
  return { send: sendFn } as unknown as LambdaClient;
}

beforeEach(() => {
  vi.clearAllMocks();
});

// ─── deleteFunction — happy path ─────────────────────────────────────────────

describe("deleteFunction — happy path", () => {
  it("calls DeleteFunctionCommand with the correct FunctionName", async () => {
    const mockSend = vi.fn().mockResolvedValueOnce({});
    vi.mocked(getLambdaClient).mockResolvedValueOnce(makeLambdaClient(mockSend));

    await deleteFunction("loopback-ecommerce-processor");

    expect(mockSend).toHaveBeenCalledOnce();
    const cmd = mockSend.mock.calls[0][0];
    expect(cmd).toBeInstanceOf(DeleteFunctionCommand);
    expect(cmd.input.FunctionName).toBe("loopback-ecommerce-processor");
  });

  it("resolves with { success: true } on success", async () => {
    const mockSend = vi.fn().mockResolvedValueOnce({});
    vi.mocked(getLambdaClient).mockResolvedValueOnce(makeLambdaClient(mockSend));

    const result = await deleteFunction("loopback-ecommerce-processor");

    expect(result).toEqual({ success: true });
  });
});

// ─── deleteFunction — error branch ───────────────────────────────────────────

describe("deleteFunction — function not found", () => {
  it("throws when the SDK throws ResourceNotFoundException", async () => {
    const notFoundError = Object.assign(
      new Error("Function not found: loopback-nonexistent"),
      { name: "ResourceNotFoundException" },
    );
    const mockSend = vi.fn().mockRejectedValueOnce(notFoundError);
    vi.mocked(getLambdaClient).mockResolvedValueOnce(makeLambdaClient(mockSend));

    await expect(deleteFunction("loopback-nonexistent")).rejects.toThrow(
      "Function not found: loopback-nonexistent",
    );
  });

  it("throws when the SDK throws any generic error", async () => {
    const genericError = new Error("Connection refused");
    const mockSend = vi.fn().mockRejectedValueOnce(genericError);
    vi.mocked(getLambdaClient).mockResolvedValueOnce(makeLambdaClient(mockSend));

    await expect(deleteFunction("any-fn")).rejects.toThrow("Connection refused");
  });
});
