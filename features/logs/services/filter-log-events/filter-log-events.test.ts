import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("@/lib/aws/config", () => ({
  createAwsConfig: vi.fn(),
}));
vi.mock("@/features/logs/lib/client/client", () => ({
  getCloudWatchLogsClient: vi.fn(),
}));
vi.mock("@/features/logs/lib/level/level", () => ({
  detectLevel: vi.fn(() => "info"),
}));
vi.mock("@/features/logs/lib/service-map/service-map", () => ({
  mapLogGroupToService: vi.fn(() => "lambda"),
}));

import { getCloudWatchLogsClient } from "@/features/logs/lib/client/client";
import { detectLevel } from "@/features/logs/lib/level/level";
import { mapLogGroupToService } from "@/features/logs/lib/service-map/service-map";
import { filterLogEvents } from "./filter-log-events";

const mockSend = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(getCloudWatchLogsClient).mockResolvedValue({
    send: mockSend,
  } as never);
});

describe("filterLogEvents", () => {
  it("maps raw FilteredLogEvent to LogEntry", async () => {
    vi.mocked(detectLevel).mockReturnValue("error");
    vi.mocked(mapLogGroupToService).mockReturnValue("lambda");

    mockSend.mockResolvedValueOnce({
      events: [
        {
          eventId: "evt-1",
          timestamp: 1700000000000,
          message: "ERROR something went wrong",
          logGroupName: "/aws/lambda/fn1",
          logStreamName: "stream-1",
        },
      ],
      nextToken: undefined,
    });

    const result = await filterLogEvents({ logGroupName: "/aws/lambda/fn1", startTime: 1699999000000 });

    expect(result.entries).toHaveLength(1);
    expect(result.entries[0]).toMatchObject({
      id: expect.any(String),
      timestamp: 1700000000000,
      message: "ERROR something went wrong",
      level: "error",
      logGroupName: "/aws/lambda/fn1",
      logStreamName: "stream-1",
      service: "lambda",
    });
  });

  it("uses startTime param in SDK command", async () => {
    mockSend.mockResolvedValueOnce({ events: [], nextToken: undefined });

    await filterLogEvents({ startTime: 1700000000000 });

    expect(mockSend).toHaveBeenCalledWith(
      expect.objectContaining({
        input: expect.objectContaining({ startTime: 1700000000000 }),
      }),
    );
  });

  it("threads logGroupName when provided", async () => {
    mockSend.mockResolvedValueOnce({ events: [], nextToken: undefined });

    await filterLogEvents({ logGroupName: "/aws/lambda/fn1" });

    expect(mockSend).toHaveBeenCalledWith(
      expect.objectContaining({
        input: expect.objectContaining({ logGroupName: "/aws/lambda/fn1" }),
      }),
    );
  });

  it("omits logGroupName from command when not provided", async () => {
    mockSend.mockResolvedValueOnce({ events: [], nextToken: undefined });

    await filterLogEvents({});

    const callArg = mockSend.mock.calls[0][0];
    expect(callArg.input).not.toHaveProperty("logGroupName");
  });

  it("paginates via nextToken", async () => {
    mockSend
      .mockResolvedValueOnce({
        events: [
          { eventId: "evt-1", timestamp: 1700000000000, message: "msg1", logGroupName: "/aws/lambda/fn1", logStreamName: "s1" },
        ],
        nextToken: "page-2",
      })
      .mockResolvedValueOnce({
        events: [
          { eventId: "evt-2", timestamp: 1700000001000, message: "msg2", logGroupName: "/aws/lambda/fn1", logStreamName: "s1" },
        ],
        nextToken: undefined,
      });

    const result = await filterLogEvents({ logGroupName: "/aws/lambda/fn1" });

    expect(result.entries).toHaveLength(2);
    expect(mockSend).toHaveBeenCalledTimes(2);
  });

  it("falls back to Date.now() when event timestamp is missing", async () => {
    const before = Date.now();
    mockSend.mockResolvedValueOnce({
      events: [
        { eventId: "evt-no-ts", message: "no timestamp", logGroupName: "/aws/lambda/fn1", logStreamName: "s1" },
      ],
      nextToken: undefined,
    });

    const result = await filterLogEvents({});
    const after = Date.now();

    expect(result.entries[0].timestamp).toBeGreaterThanOrEqual(before);
    expect(result.entries[0].timestamp).toBeLessThanOrEqual(after);
  });

  it("returns empty entries array when no events", async () => {
    mockSend.mockResolvedValueOnce({ events: [], nextToken: undefined });

    const result = await filterLogEvents({});

    expect(result.entries).toEqual([]);
    expect(result.nextToken).toBeUndefined();
  });

  it("throws on SDK error", async () => {
    const sdkError = new Error("connection refused");
    mockSend.mockRejectedValueOnce(sdkError);

    await expect(filterLogEvents({})).rejects.toThrow();
  });
});
