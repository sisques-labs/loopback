import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("@/features/lambda/services/list-functions/list-functions", () => ({
  listFunctions: vi.fn(),
}));

import { listFunctions } from "@/features/lambda/services/list-functions/list-functions";
import { listFunctionsAction } from "./list-functions-action";
import type { LambdaFunction } from "@/features/lambda/types/lambda";

const mockFunctions: LambdaFunction[] = [
  {
    functionName: "alpha-fn",
    functionArn: "arn:aws:lambda:us-east-1:000000000000:function:alpha-fn",
    runtime: "nodejs20.x",
    handler: "index.handler",
    description: "Alpha function",
    timeout: 30,
    memorySize: 128,
    lastModified: "2024-01-01T00:00:00.000Z",
    state: "Active",
  },
  {
    functionName: "beta-fn",
    functionArn: "arn:aws:lambda:us-east-1:000000000000:function:beta-fn",
    runtime: "python3.12",
    handler: "handler.lambda_handler",
    description: "Beta function",
    timeout: 60,
    memorySize: 256,
    lastModified: "2024-02-01T00:00:00.000Z",
    state: "Active",
  },
];

beforeEach(() => {
  vi.clearAllMocks();
});

describe("listFunctionsAction — success branch", () => {
  it("calls listFunctions() and returns the function array", async () => {
    vi.mocked(listFunctions).mockResolvedValue(mockFunctions);

    const result = await listFunctionsAction();

    expect(listFunctions).toHaveBeenCalledOnce();
    expect(result).toEqual(mockFunctions);
  });

  it("returns an empty array when there are no functions", async () => {
    vi.mocked(listFunctions).mockResolvedValue([]);

    const result = await listFunctionsAction();

    expect(result).toEqual([]);
  });
});

describe("listFunctionsAction — error branch", () => {
  it("re-throws errors from the underlying service", async () => {
    const error = Object.assign(new Error("Connection refused"), { name: "EndpointError" });
    vi.mocked(listFunctions).mockRejectedValue(error);

    await expect(listFunctionsAction()).rejects.toThrow("Connection refused");
  });
});
