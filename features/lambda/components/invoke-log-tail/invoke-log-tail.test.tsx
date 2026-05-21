import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";

vi.mock("@/features/logs/use-cases/get-log-events", () => ({
  getLogEventsAction: vi.fn(),
}));

vi.mock("@/components/ui/scroll-area", () => ({
  ScrollArea: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="scroll-area">{children}</div>
  ),
}));

// Import after mocks
import { getLogEventsAction } from "@/features/logs/use-cases/get-log-events";
import { InvokeLogTail } from "./invoke-log-tail";

const mockGetLogEvents = getLogEventsAction as ReturnType<typeof vi.fn>;

const dict = {
  title: "Execution Logs",
  autoScroll: "Auto-scroll",
  noLogs: "No logs yet.",
  polling: "Polling logs...",
  done: "Done.",
  collapse: "Collapse",
  expand: "Expand",
};

// A fixed epoch that is sane relative to fake timers (2024-01-01T00:00:00Z)
const BASE_NOW = new Date("2024-01-01T00:00:00Z").getTime();

function makeLogEntry(message: string) {
  return {
    id: crypto.randomUUID(),
    timestamp: BASE_NOW,
    message,
    level: "info" as const,
    logGroupName: "/aws/lambda/fn-a",
    logStreamName: "stream-1",
    service: "fn-a",
  };
}

describe("InvokeLogTail", () => {
  beforeEach(() => {
    // Set system time so Date.now() === BASE_NOW at test start.
    // This ensures invokeTimestamp === Date.now() → elapsed = 0 → no premature timeout.
    vi.useFakeTimers();
    vi.setSystemTime(BASE_NOW);
    mockGetLogEvents.mockResolvedValue({ status: "success", data: { entries: [] } });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
    cleanup();
  });

  // invokeTimestamp = Date.now() at mount time, which is BASE_NOW
  const PROPS = {
    functionName: "fn-a",
    invokeTimestamp: BASE_NOW,
    dict,
  };

  it("does NOT poll immediately on mount — no calls before 500ms delay", async () => {
    render(<InvokeLogTail {...PROPS} />);

    // Advance less than 500ms
    await act(async () => {
      vi.advanceTimersByTime(499);
    });

    expect(mockGetLogEvents).not.toHaveBeenCalled();
  });

  it("fires first poll at 500ms after mount", async () => {
    render(<InvokeLogTail {...PROPS} />);

    await act(async () => {
      vi.advanceTimersByTime(500);
      // Flush microtasks so the async poll() body executes
      await Promise.resolve();
    });

    expect(mockGetLogEvents).toHaveBeenCalledTimes(1);
    expect(mockGetLogEvents).toHaveBeenCalledWith({
      logGroupName: "/aws/lambda/fn-a",
      since: BASE_NOW,
    });
  });

  it("polls every 2 seconds after first poll", async () => {
    render(<InvokeLogTail {...PROPS} />);

    // First poll at 500ms
    await act(async () => {
      vi.advanceTimersByTime(500);
      await Promise.resolve();
    });

    expect(mockGetLogEvents).toHaveBeenCalledTimes(1);

    // +2000ms = second poll
    await act(async () => {
      vi.advanceTimersByTime(2000);
      await Promise.resolve();
    });

    expect(mockGetLogEvents).toHaveBeenCalledTimes(2);

    // +2000ms = third poll
    await act(async () => {
      vi.advanceTimersByTime(2000);
      await Promise.resolve();
    });

    expect(mockGetLogEvents).toHaveBeenCalledTimes(3);
  });

  it("shows 'No logs yet.' when first poll returns empty", async () => {
    mockGetLogEvents.mockResolvedValue({ status: "success", data: { entries: [] } });

    render(<InvokeLogTail {...PROPS} />);

    await act(async () => {
      vi.advanceTimersByTime(500);
      await Promise.resolve();
    });

    expect(screen.getByText(dict.noLogs)).toBeInTheDocument();
  });

  it("renders log events when poll returns data", async () => {
    mockGetLogEvents.mockResolvedValue({
      status: "success",
      data: { entries: [makeLogEntry("Hello from lambda")] },
    });

    render(<InvokeLogTail {...PROPS} />);

    await act(async () => {
      vi.advanceTimersByTime(500);
      await Promise.resolve();
    });

    expect(screen.getByText("Hello from lambda")).toBeInTheDocument();
  });

  it("stops polling after first empty poll following at least one non-empty poll (drain condition)", async () => {
    // First poll: returns data; second poll: empty → triggers drain stop
    mockGetLogEvents
      .mockResolvedValueOnce({
        status: "success",
        data: { entries: [makeLogEntry("Log line 1")] },
      })
      .mockResolvedValue({ status: "success", data: { entries: [] } });

    render(<InvokeLogTail {...PROPS} />);

    // First poll (500ms)
    await act(async () => {
      vi.advanceTimersByTime(500);
      await Promise.resolve();
    });

    expect(mockGetLogEvents).toHaveBeenCalledTimes(1);

    // Second poll (2000ms) — empty, triggers drain stop
    await act(async () => {
      vi.advanceTimersByTime(2000);
      await Promise.resolve();
    });

    const callsAfterDrain = mockGetLogEvents.mock.calls.length;
    expect(callsAfterDrain).toBe(2);

    // Advance further — no more calls
    await act(async () => {
      vi.advanceTimersByTime(10_000);
      await Promise.resolve();
    });

    expect(mockGetLogEvents).toHaveBeenCalledTimes(callsAfterDrain);
  });

  it("stops polling after 30 seconds from invokeTimestamp regardless of results", async () => {
    mockGetLogEvents.mockResolvedValue({
      status: "success",
      data: { entries: [makeLogEntry("still going")] },
    });

    render(<InvokeLogTail {...PROPS} />);

    // Advance to 29.5s — polling should still be active
    await act(async () => {
      vi.advanceTimersByTime(29_500);
      await Promise.resolve();
    });

    const callsBefore30s = mockGetLogEvents.mock.calls.length;
    expect(callsBefore30s).toBeGreaterThan(1);

    // Cross the 30s mark
    await act(async () => {
      vi.advanceTimersByTime(2000);
      await Promise.resolve();
    });

    // Advance well past — polling should have stopped
    await act(async () => {
      vi.advanceTimersByTime(20_000);
      await Promise.resolve();
    });

    const totalCalls = mockGetLogEvents.mock.calls.length;
    // Advance even further — count must not grow
    await act(async () => {
      vi.advanceTimersByTime(20_000);
      await Promise.resolve();
    });

    expect(mockGetLogEvents).toHaveBeenCalledTimes(totalCalls);
  });

  it("auto-scroll toggle: clicking toggle disables auto-scroll (default on)", async () => {
    render(<InvokeLogTail {...PROPS} />);

    // Toggle button should be present and labeled
    const toggle = screen.getByRole("button", { name: dict.autoScroll });
    expect(toggle).toBeInTheDocument();

    // aria-pressed should reflect on state
    expect(toggle).toHaveAttribute("aria-pressed", "true");

    // Clicking it disables auto-scroll
    fireEvent.click(toggle);

    expect(toggle).toHaveAttribute("aria-pressed", "false");
  });

  it("section is collapsible: collapse button hides log content, expand button shows it", async () => {
    render(<InvokeLogTail {...PROPS} />);

    // Initially expanded — section title visible
    expect(screen.getByText(dict.title)).toBeInTheDocument();

    // Collapse button present
    const collapseBtn = screen.getByRole("button", { name: dict.collapse });
    fireEvent.click(collapseBtn);

    // After collapse, expand button appears and collapse button is gone
    expect(screen.getByRole("button", { name: dict.expand })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: dict.collapse })).not.toBeInTheDocument();

    // Click expand
    fireEvent.click(screen.getByRole("button", { name: dict.expand }));
    expect(screen.getByRole("button", { name: dict.collapse })).toBeInTheDocument();
  });
});
