import { render, screen, cleanup } from "@testing-library/react";
import { describe, it, expect, afterEach, vi, beforeEach } from "vitest";
import type { TimelineEvent } from "../../lib/types/types";

// ── Mock store ─────────────────────────────────────────────────────────────────

const mockStartPolling = vi.fn();
const mockStopPolling = vi.fn();
const mockSeedEvents = vi.fn();
const mockSetTimeRange = vi.fn();

const mockStoreState = {
  events: [] as TimelineEvent[],
  status: "idle" as const,
  isPolling: false,
  lastUpdatedAt: null as number | null,
  timeRange: "1h" as const,
  startPolling: mockStartPolling,
  stopPolling: mockStopPolling,
  seedEvents: mockSeedEvents,
  setTimeRange: mockSetTimeRange,
  clearBuffer: vi.fn(),
};

vi.mock("../../stores/use-timeline-store/use-timeline-store", () => ({
  useTimelineStore: vi.fn((selector?: (s: typeof mockStoreState) => unknown) =>
    selector ? selector(mockStoreState) : mockStoreState
  ),
}));

// ── Fixture helpers ────────────────────────────────────────────────────────────

function makeEvent(overrides: Partial<TimelineEvent> = {}): TimelineEvent {
  return {
    eventId: "evt-1",
    timestamp: 1700000000000,
    message: "Test event",
    level: "info",
    service: "lambda",
    logGroupName: "/aws/lambda/my-fn",
    ...overrides,
  };
}

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  // Reset state
  mockStoreState.events = [];
  mockStoreState.status = "idle";
  mockStoreState.lastUpdatedAt = null;
  mockStoreState.isPolling = false;
});

// ── Tests ──────────────────────────────────────────────────────────────────────

describe("TimelineClient", () => {
  it("calls seedEvents with initialEvents on mount", async () => {
    const { TimelineClient } = await import("./timeline-client");
    const initial = [makeEvent({ eventId: "evt-seed" })];
    render(<TimelineClient initialEvents={initial} />);
    expect(mockSeedEvents).toHaveBeenCalledWith(initial);
  });

  it("calls startPolling on mount", async () => {
    const { TimelineClient } = await import("./timeline-client");
    render(<TimelineClient initialEvents={[]} />);
    expect(mockStartPolling).toHaveBeenCalled();
  });

  it("calls stopPolling on unmount", async () => {
    const { TimelineClient } = await import("./timeline-client");
    const { unmount } = render(<TimelineClient initialEvents={[]} />);
    unmount();
    expect(mockStopPolling).toHaveBeenCalled();
  });

  it("renders skeleton when status is polling and events is empty", async () => {
    mockStoreState.status = "polling";
    mockStoreState.events = [];
    mockStoreState.lastUpdatedAt = null;

    const { TimelineClient } = await import("./timeline-client");
    const { container } = render(<TimelineClient initialEvents={[]} />);
    // Skeleton items should be present
    const skeletonItems = container.querySelectorAll("[data-skeleton-item]");
    expect(skeletonItems.length).toBeGreaterThan(0);
  });

  it("renders empty state when events is empty and lastUpdatedAt is set", async () => {
    mockStoreState.status = "idle";
    mockStoreState.events = [];
    mockStoreState.lastUpdatedAt = Date.now();

    const { TimelineClient } = await import("./timeline-client");
    render(<TimelineClient initialEvents={[]} />);
    // Empty state heading should appear
    expect(screen.getByRole("heading", { name: /no events/i })).toBeInTheDocument();
  });

  it("renders event list when events are present", async () => {
    const events = [
      makeEvent({ eventId: "evt-1", message: "Event message here" }),
    ];
    mockStoreState.events = events;
    mockStoreState.status = "polling";
    mockStoreState.lastUpdatedAt = Date.now();

    const { TimelineClient } = await import("./timeline-client");
    render(<TimelineClient initialEvents={events} />);
    expect(screen.getByText("Event message here")).toBeInTheDocument();
  });

  it("renders toolbar", async () => {
    const { TimelineClient } = await import("./timeline-client");
    render(<TimelineClient initialEvents={[]} />);
    // Time range label should be visible
    expect(screen.getByText(/time range/i)).toBeInTheDocument();
  });
});
