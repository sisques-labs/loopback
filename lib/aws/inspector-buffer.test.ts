import { describe, it, expect, beforeEach } from "vitest";
import {
  pushEntry,
  getEntries,
  clearEntries,
  __setEntries,
} from "./inspector-buffer";
import type { RequestEntry } from "@/features/inspector/lib/types/types";

function makeEntry(id: string, overrides?: Partial<RequestEntry>): RequestEntry {
  return {
    id,
    timestamp: Date.now(),
    service: "SQS",
    operation: "SendMessageCommand",
    input: { QueueUrl: "https://sqs.test/queue" },
    output: { MessageId: "abc" },
    durationMs: 10,
    status: "success",
    attempts: 1,
    ...overrides,
  };
}

beforeEach(() => {
  clearEntries();
});

describe("inspectorBuffer — push / get", () => {
  it("starts empty", () => {
    expect(getEntries()).toHaveLength(0);
  });

  it("returns pushed entry", () => {
    const entry = makeEntry("1");
    pushEntry(entry);
    const result = getEntries();
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual(entry);
  });

  it("preserves insertion order", () => {
    pushEntry(makeEntry("a"));
    pushEntry(makeEntry("b"));
    pushEntry(makeEntry("c"));
    const ids = getEntries().map((e) => e.id);
    expect(ids).toEqual(["a", "b", "c"]);
  });
});

describe("inspectorBuffer — FIFO eviction at cap 200", () => {
  it("holds up to 200 entries without eviction", () => {
    for (let i = 0; i < 200; i++) pushEntry(makeEntry(String(i)));
    expect(getEntries()).toHaveLength(200);
    expect(getEntries()[0].id).toBe("0");
  });

  it("evicts the oldest entry when 201st is pushed", () => {
    for (let i = 0; i < 200; i++) pushEntry(makeEntry(String(i)));
    pushEntry(makeEntry("200"));
    const entries = getEntries();
    expect(entries).toHaveLength(200);
    // Oldest (id "0") should be gone; newest ("200") should be last
    expect(entries[0].id).toBe("1");
    expect(entries[entries.length - 1].id).toBe("200");
  });

  it("evicts multiple oldest entries when buffer is over-filled (e.g. via __setEntries)", () => {
    const overFull = Array.from({ length: 205 }, (_, i) => makeEntry(String(i)));
    __setEntries(overFull);
    pushEntry(makeEntry("205"));
    const entries = getEntries();
    expect(entries).toHaveLength(200);
    expect(entries[0].id).toBe("6");
    expect(entries[entries.length - 1].id).toBe("205");
  });
});

describe("inspectorBuffer — clearEntries", () => {
  it("returns empty after clear", () => {
    pushEntry(makeEntry("1"));
    pushEntry(makeEntry("2"));
    clearEntries();
    expect(getEntries()).toHaveLength(0);
  });

  it("allows pushing after clear", () => {
    pushEntry(makeEntry("1"));
    clearEntries();
    pushEntry(makeEntry("fresh"));
    expect(getEntries()).toHaveLength(1);
    expect(getEntries()[0].id).toBe("fresh");
  });
});

describe("inspectorBuffer — __setEntries (test escape hatch)", () => {
  it("replaces all entries", () => {
    pushEntry(makeEntry("old"));
    __setEntries([makeEntry("new1"), makeEntry("new2")]);
    const entries = getEntries();
    expect(entries).toHaveLength(2);
    expect(entries[0].id).toBe("new1");
  });

  it("accepts empty array to reset", () => {
    pushEntry(makeEntry("x"));
    __setEntries([]);
    expect(getEntries()).toHaveLength(0);
  });
});
