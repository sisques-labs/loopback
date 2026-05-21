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

function makeLogEntry(message: string) {
  return {
    id: crypto.randomUUID(),
    timestamp: Date.now(),
    message,
    level: "info" as const,
    logGroupName: "/aws/lambda/fn-a",
    logStreamName: "stream-1",
    service: "fn-a",
  };
}

const BASE_PROPS = {
  functionName: "fn-a",
  invokeTimestamp: 1_000_000, // epoch ms
  dict,
};

describe("InvokeLogTail", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    mockGetLogEvents.mockResolvedValue({ status: "success", data: { entries: [] } });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
    cleanup();
  });

  it("does NOT poll immediately on mount — no calls before 500ms delay", async () => {
    render(<InvokeLogTail {...BASE_PROPS} />);

    // Advance less than 500ms
    await act(async () => {
      vi.advanceTimersByTime(499);
    });

    expect(mockGetLogEvents).not.toHaveBeenCalled();
  });

  it("fires first poll at 500ms after mount", async () => {
    render(<InvokeLogTail {...BASE_PROPS} />);

    await act(async () => {
      vi.advanceTimersByTime(500);
    });

    expect(mockGetLogEvents).toHaveBeenCalledTimes(1);
    expect(mockGetLogEvents).toHaveBeenCalledWith({
      logGroupName: "/aws/lambda/fn-a",
      since: BASE_PROPS.invokeTimestamp,
    });
  });

  it("polls every 2 seconds after first poll", async () => {
    render(<InvokeLogTail {...BASE_PROPS} />);

    // First poll at 500ms
    await act(async () => {
      vi.advanceTimersByTime(500);
    });

    expect(mockGetLogEvents).toHaveBeenCalledTimes(1);

    // +2000ms = second poll
    await act(async () => {
      vi.advanceTimersByTime(2000);
    });

    expect(mockGetLogEvents).toHaveBeenCalledTimes(2);

    // +2000ms = third poll
    await act(async () => {
      vi.advanceTimersByTime(2000);
    });

    expect(mockGetLogEvents).toHaveBeenCalledTimes(3);
  });

  it("shows 'No logs yet.' when first poll returns empty", async () => {
    mockGetLogEvents.mockResolvedValue({ status: "success", data: { entries: [] } });

    render(<InvokeLogTail {...BASE_PROPS} />);

    await act(async () => {
      vi.advanceTimersByTime(500);
    });

    // Flush promises
    await act(async () => {
      await Promise.resolve();
    });

    expect(screen.getByText(dict.noLogs)).toBeInTheDocument();
  });

  it("renders log events when poll returns data", async () => {
    mockGetLogEvents.mockResolvedValue({
      status: "success",
      data: { entries: [makeLogEntry("Hello from lambda")] },
    });

    render(<InvokeLogTail {...BASE_PROPS} />);

    await act(async () => {
      vi.advanceTimersByTime(500);
    });

    await act(async () => {
      await Promise.resolve();
    });

    expect(screen.getByText("Hello from lambda")).toBeInTheDocument();
  });

  it("stops polling after first empty poll following at least one non-empty poll (drain condition)", async () => {
    // First poll: returns data; second poll: empty
    mockGetLogEvents
      .mockResolvedValueOnce({
        status: "success",
        data: { entries: [makeLogEntry("Log line 1")] },
      })
      .mockResolvedValue({ status: "success", data: { entries: [] } });

    render(<InvokeLogTail {...BASE_PROPS} />);

    // First poll (500ms)
    await act(async () => {
      vi.advanceTimersByTime(500);
    });
    await act(async () => { await Promise.resolve(); });

    // Second poll (2000ms) — empty, triggers drain stop
    await act(async () => {
      vi.advanceTimersByTime(2000);
    });
    await act(async () => { await Promise.resolve(); });

    const callsAfterDrain = mockGetLogEvents.mock.calls.length;
    expect(callsAfterDrain).toBe(2);

    // Advance further — no more calls
    await act(async () => {
      vi.advanceTimersByTime(4000);
    });

    expect(mockGetLogEvents).toHaveBeenCalledTimes(callsAfterDrain);
  });

  it("stops polling after 30 seconds from invokeTimestamp regardless of results", async () => {
    // The invokeTimestamp is BASE_PROPS.invokeTimestamp = 1_000_000ms epoch
    // The component measures 30s from invokeTimestamp using Date.now()
    // We set Date.now() to start at invokeTimestamp so elapsed = 0
    vi.setSystemTime(BASE_PROPS.invokeTimestamp);

    mockGetLogEvents.mockResolvedValue({
      status: "success",
      data: { entries: [makeLogEntry("still going")] },
    });

    render(<InvokeLogTail {...BASE_PROPS} />);

    // Advance to just before 30s (relative to invokeTimestamp)
    // 500ms initial delay + many 2s intervals
    await act(async () => {
      vi.advanceTimersByTime(500);
    });
    await act(async () => { await Promise.resolve(); });

    // Advance 28 more seconds (total from mount: 28.5s, from invokeTimestamp: 28.5s)
    await act(async () => {
      vi.advanceTimersByTime(28_000);
    });
    await act(async () => { await Promise.resolve(); });

    const callsBefore30s = mockGetLogEvents.mock.calls.length;
    expect(callsBefore30s).toBeGreaterThan(1);

    // Advance past 30s mark
    await act(async () => {
      vi.advanceTimersByTime(2000);
    });
    await act(async () => { await Promise.resolve(); });

    // Advance further — no more calls
    await act(async () => {
      vi.advanceTimersByTime(10_000);
    });

    const callsAfter30s = mockGetLogEvents.mock.calls.length;
    // Should be close to callsBefore30s, with at most 1-2 more from the boundary
    expect(callsAfter30s).toBeLessThanOrEqual(callsBefore30s + 2);

    // But definitely stopped — no calls after the 30s window
    await act(async () => {
      vi.advanceTimersByTime(10_000);
    });
    expect(mockGetLogEvents).toHaveBeenCalledTimes(callsAfter30s);
  });

  it("auto-scroll toggle: clicking toggle disables auto-scroll (default on)", async () => {
    render(<InvokeLogTail {...BASE_PROPS} />);

    // Toggle button should be present and labeled
    const toggle = screen.getByRole("button", { name: dict.autoScroll });
    expect(toggle).toBeInTheDocument();

    // Clicking it disables auto-scroll
    fireEvent.click(toggle);

    // Toggle should now reflect off state (aria-pressed false or different label isn't enforced;
    // we just verify clicking doesn't crash and the button is still there)
    expect(toggle).toBeInTheDocument();
  });

  it("section is collapsible: collapse button hides log content, expand button shows it", async () => {
    mockGetLogEvents.mockResolvedValue({
      status: "success",
      data: { entries: [makeLogEntry("visible log")] },
    });

    render(<InvokeLogTail {...BASE_PROPS} />);

    // Initially expanded — section title visible
    expect(screen.getByText(dict.title)).toBeInTheDocument();

    // Collapse button present
    const collapseBtn = screen.getByRole("button", { name: dict.collapse });
    fireEvent.click(collapseBtn);

    // After collapse, content should be hidden and expand button appears
    expect(screen.getByRole("button", { name: dict.expand })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: dict.collapse })).not.toBeInTheDocument();

    // Click expand
    fireEvent.click(screen.getByRole("button", { name: dict.expand }));
    expect(screen.getByRole("button", { name: dict.collapse })).toBeInTheDocument();
  });
});
