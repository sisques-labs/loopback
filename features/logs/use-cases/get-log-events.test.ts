import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("@/lib/aws/config", () => ({
  createAwsConfig: vi.fn(),
}));
vi.mock("@/features/logs/services/filter-log-events/filter-log-events", () => ({
  filterLogEvents: vi.fn(),
}));

import { filterLogEvents } from "@/features/logs/services/filter-log-events/filter-log-events";
import { getLogEventsAction } from "./get-log-events";
import type { LogEntry } from "@/features/logs/lib/criteria/types";

const makeEntry = (id: string): LogEntry => ({
  id,
  timestamp: 1700000000000,
  message: "test message",
  level: "info",
  logGroupName: "/aws/lambda/fn1",
  logStreamName: "stream-1",
  service: "lambda",
});

beforeEach(() => {
  vi.clearAllMocks();
});

describe("getLogEventsAction", () => {
  it("returns entries and nextToken on success", async () => {
    const entries = [makeEntry("evt-1"), makeEntry("evt-2")];
    vi.mocked(filterLogEvents).mockResolvedValueOnce({ entries, nextToken: "tok-1" });

    const result = await getLogEventsAction({ since: 1700000000000 });

    expect(result).toEqual({ status: "success", data: { entries, nextToken: "tok-1" } });
  });

  it("threads logGroupName when provided", async () => {
    vi.mocked(filterLogEvents).mockResolvedValueOnce({ entries: [], nextToken: undefined });

    await getLogEventsAction({ since: 1700000000000, logGroupName: "/aws/lambda/fn1" });

    expect(vi.mocked(filterLogEvents)).toHaveBeenCalledWith(
      expect.objectContaining({ logGroupName: "/aws/lambda/fn1" }),
    );
  });

  it("omits logGroupName from filterLogEvents when not provided", async () => {
    vi.mocked(filterLogEvents).mockResolvedValueOnce({ entries: [], nextToken: undefined });

    await getLogEventsAction({ since: 1700000000000 });

    const callArg = vi.mocked(filterLogEvents).mock.calls[0][0];
    expect(callArg).not.toHaveProperty("logGroupName");
  });

  it("passes since as startTime to filterLogEvents", async () => {
    vi.mocked(filterLogEvents).mockResolvedValueOnce({ entries: [], nextToken: undefined });

    await getLogEventsAction({ since: 1699990000000 });

    expect(vi.mocked(filterLogEvents)).toHaveBeenCalledWith(
      expect.objectContaining({ startTime: 1699990000000 }),
    );
  });

  it("returns status error with message on failure", async () => {
    vi.mocked(filterLogEvents).mockRejectedValueOnce(new Error("network failure"));

    const result = await getLogEventsAction({ since: 1700000000000 });

    expect(result).toMatchObject({ status: "error", message: expect.any(String) });
  });

  it("returns empty entries when filterLogEvents returns empty", async () => {
    vi.mocked(filterLogEvents).mockResolvedValueOnce({ entries: [], nextToken: undefined });

    const result = await getLogEventsAction({ since: 1700000000000 });

    expect(result).toEqual({ status: "success", data: { entries: [], nextToken: undefined } });
  });
});
