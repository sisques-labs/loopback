import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("@/lib/aws/inspector-buffer", () => ({
  getEntries: vi.fn(),
  clearEntries: vi.fn(),
}));

import { getEntries, clearEntries } from "@/lib/aws/inspector-buffer";
import {
  getInspectorEntriesAction,
  clearInspectorBufferAction,
} from "./get-inspector-entries";
import type { RequestEntry } from "@/features/inspector/lib/types/types";

const makeEntry = (id: string): RequestEntry => ({
  id,
  timestamp: 1700000000000,
  service: "SQS",
  operation: "SendMessageCommand",
  input: { QueueUrl: "http://sqs.us-east-1.localhost:4566/000000000000/test" },
  output: { MessageId: "msg-1" },
  durationMs: 42,
  status: "success",
  attempts: 1,
});

beforeEach(() => {
  vi.clearAllMocks();
});

describe("getInspectorEntriesAction", () => {
  it("returns entries from the buffer on success", async () => {
    const entries = [makeEntry("e-1"), makeEntry("e-2")];
    vi.mocked(getEntries).mockReturnValue(entries);

    const result = await getInspectorEntriesAction({});

    expect(result).toEqual({ status: "success", data: { entries } });
  });

  it("returns all entries when no since filter", async () => {
    const entries = [makeEntry("e-1")];
    vi.mocked(getEntries).mockReturnValue(entries);

    const result = await getInspectorEntriesAction();

    expect(result).toMatchObject({ status: "success", data: { entries } });
  });

  it("filters entries by since when provided", async () => {
    const entries = [
      makeEntry("old"),
      { ...makeEntry("new"), timestamp: 1700000010000 },
    ];
    vi.mocked(getEntries).mockReturnValue(entries);

    const result = await getInspectorEntriesAction({ since: 1700000005000 });

    expect(result.status).toBe("success");
    if (result.status === "success") {
      expect(result.data.entries).toHaveLength(1);
      expect(result.data.entries[0].id).toBe("new");
    }
  });

  it("returns error status when getEntries throws", async () => {
    vi.mocked(getEntries).mockImplementation(() => {
      throw new Error("buffer exploded");
    });

    const result = await getInspectorEntriesAction({});

    expect(result).toMatchObject({ status: "error", message: expect.any(String) });
  });

  it("returns empty entries when buffer is empty", async () => {
    vi.mocked(getEntries).mockReturnValue([]);

    const result = await getInspectorEntriesAction({});

    expect(result).toEqual({ status: "success", data: { entries: [] } });
  });
});

describe("clearInspectorBufferAction", () => {
  it("calls clearEntries and returns success", async () => {
    const result = await clearInspectorBufferAction();

    expect(vi.mocked(clearEntries)).toHaveBeenCalledOnce();
    expect(result).toEqual({ status: "success", data: undefined });
  });

  it("returns error status when clearEntries throws", async () => {
    vi.mocked(clearEntries).mockImplementation(() => {
      throw new Error("clear failed");
    });

    const result = await clearInspectorBufferAction();

    expect(result).toMatchObject({ status: "error", message: expect.any(String) });
  });
});
