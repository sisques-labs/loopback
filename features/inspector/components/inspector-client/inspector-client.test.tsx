import { cleanup, render, screen, act } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { RequestEntry } from "@/features/inspector/lib/types/types";
import type { InspectorDict } from "@/features/inspector/i18n/en";
import type { WidenStringLiterals } from "@/features/shared/i18n/widen-literals";

// ── Mocks ─────────────────────────────────────────────────────────────────────

const mockSeedEntries = vi.fn();
const mockStartPolling = vi.fn();
const mockStopPolling = vi.fn();
const mockRehydrate = vi.fn().mockResolvedValue(undefined);

vi.mock(
  "@/features/inspector/stores/use-inspector-store/use-inspector-store",
  () => {
    const mockStore = vi.fn(() => ({
      entries: [],
      filters: { service: "", status: "all", text: "" },
      status: "idle",
      lastUpdatedAt: null,
      isPolling: false,
      view: "list",
      seedEntries: mockSeedEntries,
      startPolling: mockStartPolling,
      stopPolling: mockStopPolling,
      setFilter: vi.fn(),
      clearBuffer: vi.fn(),
      setView: vi.fn(),
    }));
    mockStore.persist = { rehydrate: mockRehydrate };
    return { useInspectorStore: mockStore };
  },
);

vi.mock("@/features/inspector/components/inspector-toolbar/inspector-toolbar", () => ({
  InspectorToolbar: () => <div data-testid="inspector-toolbar" />,
}));

vi.mock("@/features/inspector/components/request-list/request-list", () => ({
  RequestList: ({ entries }: { entries: RequestEntry[] }) => (
    <div data-testid="request-list" data-count={entries.length} />
  ),
}));

import { InspectorClient } from "./inspector-client";

// ── Fixtures ──────────────────────────────────────────────────────────────────

type ClientDict = Pick<
  WidenStringLiterals<InspectorDict>,
  "toolbar" | "empty" | "card" | "detail"
>;

const dict: ClientDict = {
  toolbar: {
    filters: {
      service: { label: "Service", all: "All services" },
      status: { label: "Status", all: "All", success: "Success", error: "Error" },
      text: { placeholder: "Search…" },
    },
    clearBuffer: "Clear",
    statusPolling: "Live",
    statusError: "Error",
    statusIdle: "Idle",
    lastUpdated: "Updated {time} ago",
  },
  empty: { title: "No requests", body: "Make some AWS calls" },
  card: { duration: "{ms}ms", attempts: "{n} attempts" },
  detail: {
    title: "Detail",
    input: "Input",
    output: "Output",
    attempts: "Attempts",
    duration: "Duration",
    timestamp: "Timestamp",
    error: "Error",
    closeLabel: "Close",
  },
};

function makeEntry(id: string): RequestEntry {
  return {
    id,
    timestamp: 1700000000000,
    service: "SQS",
    operation: "SendMessageCommand",
    input: {},
    output: {},
    durationMs: 10,
    status: "success",
    attempts: 1,
  };
}

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  mockRehydrate.mockResolvedValue(undefined);
});

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("InspectorClient", () => {
  it("renders the toolbar", async () => {
    await act(async () => {
      render(<InspectorClient initialEntries={[]} dict={dict} />);
    });
    expect(screen.getByTestId("inspector-toolbar")).toBeInTheDocument();
  });

  it("renders the request list", async () => {
    await act(async () => {
      render(<InspectorClient initialEntries={[]} dict={dict} />);
    });
    expect(screen.getByTestId("request-list")).toBeInTheDocument();
  });

  it("calls rehydrate on mount", async () => {
    await act(async () => {
      render(<InspectorClient initialEntries={[]} dict={dict} />);
    });
    expect(mockRehydrate).toHaveBeenCalledOnce();
  });

  it("calls seedEntries with initialEntries on mount", async () => {
    const entries = [makeEntry("e1"), makeEntry("e2")];
    await act(async () => {
      render(<InspectorClient initialEntries={entries} dict={dict} />);
    });
    expect(mockSeedEntries).toHaveBeenCalledWith(entries);
  });

  it("calls startPolling on mount", async () => {
    await act(async () => {
      render(<InspectorClient initialEntries={[]} dict={dict} />);
    });
    expect(mockStartPolling).toHaveBeenCalledOnce();
  });
});
