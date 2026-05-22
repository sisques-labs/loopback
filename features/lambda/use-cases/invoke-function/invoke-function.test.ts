import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/features/lambda/lib/client", () => ({
  getLambdaClient: vi.fn(),
}));

import { InvokeCommand } from "@aws-sdk/client-lambda";
import { getLambdaClient } from "@/features/lambda/lib/client";
import { invokeFunctionAction } from "./invoke-function";
import type { ActionState } from "@/features/shared/types/action-state";
import type { InvokeResult } from "@/features/lambda/types/lambda";

function makeLambdaClient(sendFn: (cmd: unknown) => Promise<unknown>) {
  return { send: sendFn } as unknown as Awaited<ReturnType<typeof getLambdaClient>>;
}

function buildFormData(fields: Record<string, string>): FormData {
  const fd = new FormData();
  for (const [k, v] of Object.entries(fields)) {
    fd.append(k, v);
  }
  return fd;
}

const idle: ActionState<InvokeResult> = { status: "idle" };

beforeEach(() => {
  vi.clearAllMocks();
});

describe("invokeFunctionAction — empty payload (existing behavior)", () => {
  it("invokes successfully with empty payload", async () => {
    vi.mocked(getLambdaClient).mockResolvedValue(
      makeLambdaClient(async (cmd) => {
        if (cmd instanceof InvokeCommand) {
          return { StatusCode: 200, Payload: new TextEncoder().encode('"ok"') };
        }
        throw new Error("unexpected command");
      }),
    );

    const result = await invokeFunctionAction(
      idle,
      buildFormData({ functionName: "my-fn", payload: "", locale: "en" }),
    );

    expect(result.status).toBe("success");
  });
});

describe("invokeFunctionAction — JSON validation", () => {
  it("returns error for invalid JSON payload", async () => {
    const result = await invokeFunctionAction(
      idle,
      buildFormData({
        functionName: "my-fn",
        payload: "{broken json",
        locale: "en",
      }),
    );

    expect(result.status).toBe("error");
    if (result.status === "error") {
      expect(result.message).toBeTruthy();
    }
  });

  it("accepts a valid JSON object payload", async () => {
    vi.mocked(getLambdaClient).mockResolvedValue(
      makeLambdaClient(async (cmd) => {
        if (cmd instanceof InvokeCommand) {
          return { StatusCode: 200, Payload: new TextEncoder().encode('"ok"') };
        }
        throw new Error("unexpected command");
      }),
    );

    const result = await invokeFunctionAction(
      idle,
      buildFormData({
        functionName: "my-fn",
        payload: '{"key":"value"}',
        locale: "en",
      }),
    );

    expect(result.status).toBe("success");
  });
});

describe("invokeFunctionAction — size validation (6 MB limit)", () => {
  it("returns error when payload exceeds 6 MB", async () => {
    // Create a JSON payload larger than 6 MB
    const bigPayload = '{"data":"' + "x".repeat(7 * 1024 * 1024) + '"}';

    const result = await invokeFunctionAction(
      idle,
      buildFormData({
        functionName: "my-fn",
        payload: bigPayload,
        locale: "en",
      }),
    );

    expect(result.status).toBe("error");
    if (result.status === "error") {
      expect(result.message).toBeTruthy();
    }
  });

  it("accepts a payload within the 6 MB limit", async () => {
    vi.mocked(getLambdaClient).mockResolvedValue(
      makeLambdaClient(async (cmd) => {
        if (cmd instanceof InvokeCommand) {
          return { StatusCode: 200, Payload: new TextEncoder().encode('"ok"') };
        }
        throw new Error("unexpected command");
      }),
    );

    const result = await invokeFunctionAction(
      idle,
      buildFormData({
        functionName: "my-fn",
        payload: '{"key":"value"}',
        locale: "en",
      }),
    );

    expect(result.status).toBe("success");
  });
});
