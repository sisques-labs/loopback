import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("@/lib/aws/config", () => ({
  createAwsConfig: vi.fn(),
}));
vi.mock("@/features/logs/lib/client", () => ({
  getCloudWatchLogsClient: vi.fn(),
}));

import { getCloudWatchLogsClient } from "@/features/logs/lib/client";
import { listLogGroups } from "./list-log-groups";

const mockSend = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(getCloudWatchLogsClient).mockResolvedValue({
    send: mockSend,
  } as never);
});

describe("listLogGroups", () => {
  it("returns log group names as string[]", async () => {
    mockSend.mockResolvedValueOnce({
      logGroups: [
        { logGroupName: "/aws/lambda/fn1" },
        { logGroupName: "/aws/s3/bucket" },
      ],
      nextToken: undefined,
    });

    const result = await listLogGroups();

    expect(result).toEqual(["/aws/lambda/fn1", "/aws/s3/bucket"]);
  });

  it("paginates via nextToken until exhausted", async () => {
    mockSend
      .mockResolvedValueOnce({
        logGroups: [{ logGroupName: "/aws/lambda/fn1" }],
        nextToken: "token-1",
      })
      .mockResolvedValueOnce({
        logGroups: [{ logGroupName: "/aws/s3/bucket" }],
        nextToken: undefined,
      });

    const result = await listLogGroups();

    expect(result).toEqual(["/aws/lambda/fn1", "/aws/s3/bucket"]);
    expect(mockSend).toHaveBeenCalledTimes(2);
  });

  it("returns empty array when no log groups exist", async () => {
    mockSend.mockResolvedValueOnce({
      logGroups: [],
      nextToken: undefined,
    });

    const result = await listLogGroups();

    expect(result).toEqual([]);
  });

  it("skips log groups with undefined name", async () => {
    mockSend.mockResolvedValueOnce({
      logGroups: [{ logGroupName: "/aws/lambda/fn1" }, { logGroupName: undefined }],
      nextToken: undefined,
    });

    const result = await listLogGroups();

    expect(result).toEqual(["/aws/lambda/fn1"]);
  });

  it("throws a friendly error on SDK failure", async () => {
    const sdkError = new Error("Network error");
    sdkError.name = "ServiceException";
    mockSend.mockRejectedValueOnce(sdkError);

    await expect(listLogGroups()).rejects.toThrow();
  });
});
