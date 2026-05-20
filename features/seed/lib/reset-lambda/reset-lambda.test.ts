import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("@/features/lambda/lib/client", () => ({
  getLambdaClient: vi.fn(),
}));

import {
  ListFunctionsCommand,
  DeleteFunctionCommand,
  type LambdaClient,
} from "@aws-sdk/client-lambda";
import { getLambdaClient } from "@/features/lambda/lib/client";
import { resetLambda } from "./reset-lambda";

function makeClient(sendFn: (cmd: unknown) => Promise<unknown>): LambdaClient {
  return { send: sendFn } as unknown as LambdaClient;
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("resetLambda — no functions", () => {
  it("returns empty arrays when there are no functions", async () => {
    const mockSend = vi.fn().mockImplementation((cmd: unknown) => {
      if (cmd instanceof ListFunctionsCommand) return { Functions: [] };
      return {};
    });
    vi.mocked(getLambdaClient).mockResolvedValue(makeClient(mockSend));

    const result = await resetLambda();

    expect(result.deleted).toHaveLength(0);
    expect(result.failed).toHaveLength(0);
  });
});

describe("resetLambda — happy path", () => {
  it("lists and deletes all functions", async () => {
    const mockSend = vi.fn().mockImplementation((cmd: unknown) => {
      if (cmd instanceof ListFunctionsCommand) {
        return {
          Functions: [
            { FunctionName: "loopback-ecommerce-processor" },
            { FunctionName: "loopback-blog-publisher" },
          ],
        };
      }
      if (cmd instanceof DeleteFunctionCommand) return {};
      return {};
    });
    vi.mocked(getLambdaClient).mockResolvedValue(makeClient(mockSend));

    const result = await resetLambda();

    const deleteCount = mockSend.mock.calls.filter(
      ([cmd]) => cmd instanceof DeleteFunctionCommand,
    ).length;
    expect(deleteCount).toBe(2);

    expect(result.deleted).toContain("loopback-ecommerce-processor");
    expect(result.deleted).toContain("loopback-blog-publisher");
    expect(result.failed).toHaveLength(0);
  });
});

describe("resetLambda — partial failure", () => {
  it("records failed function on error, continues others", async () => {
    const mockSend = vi.fn().mockImplementation((cmd: unknown) => {
      if (cmd instanceof ListFunctionsCommand) {
        return { Functions: [{ FunctionName: "ok-fn" }, { FunctionName: "fail-fn" }] };
      }
      if (cmd instanceof DeleteFunctionCommand) {
        const name = (cmd as DeleteFunctionCommand).input.FunctionName ?? "";
        if (name === "fail-fn") throw new Error("Not found");
        return {};
      }
      return {};
    });
    vi.mocked(getLambdaClient).mockResolvedValue(makeClient(mockSend));

    const result = await resetLambda();

    expect(result.deleted).toContain("ok-fn");
    expect(result.failed).toContain("fail-fn");
  });
});

describe("resetLambda — dry-run", () => {
  it("returns function count without deleting", async () => {
    const mockSend = vi.fn().mockImplementation((cmd: unknown) => {
      if (cmd instanceof ListFunctionsCommand) {
        return { Functions: [{ FunctionName: "fn1" }, { FunctionName: "fn2" }, { FunctionName: "fn3" }] };
      }
      return {};
    });
    vi.mocked(getLambdaClient).mockResolvedValue(makeClient(mockSend));

    const count = await resetLambda({ dryRun: true });

    expect(count).toBe(3);
    const deleteCalls = mockSend.mock.calls.filter(
      ([cmd]) => cmd instanceof DeleteFunctionCommand,
    );
    expect(deleteCalls).toHaveLength(0);
  });
});
