import { cleanup, render, screen, act } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { RequestEntry } from "@/features/inspector/lib/types/types";
import type { InspectorDict } from "@/features/inspector/i18n/en";
import type { WidenStringLiterals } from "@/features/shared/i18n/widen-literals";

// ── Mocks ─────────────────────────────────────────────────────────────────────
// vi.mock() is hoisted to the top of the file, BEFORE any const declarations.
// To reference mock functions inside a vi.mock factory, they must be declared
// with vi.hoisted() which runs at the same "hoisted" phase as vi.mock itself.

const {
  mockSeedEntries,
  mockStartPolling,
  mockStopPolling,
  mockRehydrate,
  mockStoreState,
} = vi.hoisted(() => {
  const state = {
    entries: [] as RequestEntry[],
    isLoading: false,
    view: "list" as "list" | "timeline",
  };
  return {
    mockSeedEntries: vi.fn(),
    mockStartPolling: vi.fn(),
    mockStopPolling: vi.fn(),
    mockRehydrate: vi.fn().mockResolvedValue(undefined),
    mockStoreState: state,
  };
});

vi.mock(
  "@/features/inspector/stores/use-inspector-store/use-inspector-store",
  () => {
    const mockStore = vi.fn(() => ({
      entries: mockStoreState.entries,
      filters: { service: "", status: "all", text: "" },
      status: mockStoreState.isLoading ? "polling" : "idle",
      isLoading: mockStoreState.isLoading,
      lastUpdatedAt: null,
      isPolling: mockStoreState.isLoading,
      view: mockStoreState.view,
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

vi.mock("@/features/inspector/components/inspector-timeline/inspector-timeline", () => ({
  InspectorTimeline: ({ entries }: { entries: RequestEntry[] }) => (
    <div data-testid="inspector-timeline" data-count={entries.length} />
  ),
}));

vi.mock("@/features/inspector/components/inspector-empty/inspector-empty", () => ({
  InspectorEmpty: () => <div data-testid="inspector-empty" />,
}));

vi.mock("@/features/inspector/components/inspector-skeleton/inspector-skeleton", () => ({
  InspectorSkeleton: ({ withSpine }: { withSpine: boolean }) => (
    <div data-testid="inspector-skeleton" data-with-spine={withSpine} />
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
    view: { label: "View", list: "List", timeline: "Timeline" },
    clearBuffer: "Clear",
    statusPolling: "Live",
    statusError: "Error",
    statusIdle: "Idle",
    lastUpdated: "Updated {time} ago",
  },
  empty: { title: "No requests", body: "Make some AWS calls" },
  card: { duration: "{ms}ms", attempts: "{n} attempts", retries: "{n} retries" },
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
  mockStoreState.entries = [];
  mockStoreState.isLoading = false;
  mockStoreState.view = "list";
});

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("InspectorClient", () => {
  it("renders the toolbar", async () => {
    await act(async () => {
      render(<InspectorClient initialEntries={[]} dict={dict} />);
    });
    expect(screen.getByTestId("inspector-toolbar")).toBeInTheDocument();
  });

  it("renders the request list when entries exist", async () => {
    mockStoreState.entries = [makeEntry("e1")];
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

  // ── Task 3.12 / 3.13: view toggle ────────────────────────────────────────────

  it("renders RequestList when view is 'list' and entries exist", async () => {
    mockStoreState.entries = [makeEntry("e1")];
    mockStoreState.view = "list";
    await act(async () => {
      render(<InspectorClient initialEntries={[]} dict={dict} />);
    });
    expect(screen.getByTestId("request-list")).toBeInTheDocument();
    expect(screen.queryByTestId("inspector-timeline")).not.toBeInTheDocument();
  });

  it("renders InspectorTimeline when view is 'timeline' and entries exist", async () => {
    mockStoreState.entries = [makeEntry("e1")];
    mockStoreState.view = "timeline";
    await act(async () => {
      render(<InspectorClient initialEntries={[]} dict={dict} />);
    });
    expect(screen.getByTestId("inspector-timeline")).toBeInTheDocument();
    expect(screen.queryByTestId("request-list")).not.toBeInTheDocument();
  });

  it("renders InspectorSkeleton when isLoading is true", async () => {
    mockStoreState.isLoading = true;
    await act(async () => {
      render(<InspectorClient initialEntries={[]} dict={dict} />);
    });
    expect(screen.getByTestId("inspector-skeleton")).toBeInTheDocument();
    expect(screen.queryByTestId("request-list")).not.toBeInTheDocument();
    expect(screen.queryByTestId("inspector-timeline")).not.toBeInTheDocument();
  });

  it("renders InspectorEmpty when no entries and not loading", async () => {
    mockStoreState.entries = [];
    mockStoreState.isLoading = false;
    await act(async () => {
      render(<InspectorClient initialEntries={[]} dict={dict} />);
    });
    expect(screen.getByTestId("inspector-empty")).toBeInTheDocument();
    expect(screen.queryByTestId("request-list")).not.toBeInTheDocument();
    expect(screen.queryByTestId("inspector-timeline")).not.toBeInTheDocument();
  });
});
