import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";

// jsdom does not implement scrollIntoView — mock it globally for these tests
Element.prototype.scrollIntoView = vi.fn();
import type { LogEntry, LogFilters } from "@/features/logs/lib/types/types";
import type { LogsDict } from "@/features/logs/i18n/en";

// ── Mock useLogsStore ────────────────────────────────────────────────────────

const mockToggleAutoScroll = vi.fn();
const mockSetAutoScroll = vi.fn();

const storeState = {
  entries: [] as LogEntry[],
  filters: { service: "", level: "all", text: "" } as LogFilters,
  autoScroll: true,
  status: "idle" as const,
  lastUpdatedAt: null as number | null,
  toggleAutoScroll: mockToggleAutoScroll,
  setAutoScroll: mockSetAutoScroll,
};

vi.mock("@/features/logs/stores/use-logs-store/use-logs-store", () => ({
  useLogsStore: vi.fn(() => storeState),
}));

import { LogsPanel } from "./logs-panel";

// ── Dict fixture ──────────────────────────────────────────────────────────────

const dict = {
  entry: {
    level: { info: "INFO", warn: "WARN", error: "ERROR", unknown: "UNKNOWN" },
  },
  autoScroll: { enable: "Auto-scroll" },
  empty: "No log entries",
  noMatch: "No matches for current filters",
} as Pick<LogsDict, "entry" | "autoScroll" | "empty" | "noMatch">;

function makeEntry(overrides: Partial<LogEntry> = {}): LogEntry {
  return {
    id: `entry-${Math.random()}`,
    timestamp: Date.now(),
    message: "Test log message",
    level: "info",
    logGroupName: "/aws/lambda/my-fn",
    logStreamName: "stream",
    service: "lambda",
    ...overrides,
  };
}

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

beforeEach(() => {
  storeState.entries = [];
  storeState.filters = { service: "", level: "all" as const, text: "" };
  storeState.autoScroll = true;
  storeState.status = "idle";
  storeState.lastUpdatedAt = null;
  mockSetAutoScroll.mockClear();
  mockToggleAutoScroll.mockClear();
});

// ── Tests ────────────────────────────────────────────────────────────────────

describe("LogsPanel", () => {
  it("renders empty state when no entries", () => {
    storeState.entries = [];
    render(<LogsPanel dict={dict} />);
    expect(screen.getByText("No log entries")).toBeInTheDocument();
  });

  it("renders noMatch state when entries exist but filter matches nothing", () => {
    storeState.entries = [makeEntry({ message: "lambda msg", service: "lambda" })];
    storeState.filters = { service: "s3", level: "all", text: "" };
    render(<LogsPanel dict={dict} />);
    expect(screen.getByText("No matches for current filters")).toBeInTheDocument();
    expect(screen.queryByText("No log entries")).toBeNull();
  });

  it("does not show noMatch when buffer is empty (shows empty state instead)", () => {
    storeState.entries = [];
    storeState.filters = { service: "s3", level: "all", text: "" };
    render(<LogsPanel dict={dict} />);
    expect(screen.getByText("No log entries")).toBeInTheDocument();
    expect(screen.queryByText("No matches for current filters")).toBeNull();
  });

  it("renders log entries when present", () => {
    storeState.entries = [
      makeEntry({ message: "Lambda invoked", level: "info" }),
      makeEntry({ message: "Lambda errored", level: "error" }),
    ];
    render(<LogsPanel dict={dict} />);
    expect(screen.getByText("Lambda invoked")).toBeInTheDocument();
    expect(screen.getByText("Lambda errored")).toBeInTheDocument();
  });

  it("filters entries based on store filters (service)", () => {
    storeState.entries = [
      makeEntry({ message: "Lambda msg", service: "lambda" }),
      makeEntry({ message: "S3 msg", service: "s3" }),
    ];
    storeState.filters = { service: "lambda", level: "all", text: "" };
    render(<LogsPanel dict={dict} />);
    expect(screen.getByText("Lambda msg")).toBeInTheDocument();
    expect(screen.queryByText("S3 msg")).toBeNull();
  });

  it("filters entries by text search", () => {
    storeState.entries = [
      makeEntry({ message: "timeout error occurred" }),
      makeEntry({ message: "all clear" }),
    ];
    storeState.filters = { service: "", level: "all", text: "timeout" };
    render(<LogsPanel dict={dict} />);
    expect(screen.getByText("timeout error occurred")).toBeInTheDocument();
    expect(screen.queryByText("all clear")).toBeNull();
  });

  it("filters entries by level", () => {
    storeState.entries = [
      makeEntry({ message: "info msg", level: "info" }),
      makeEntry({ message: "error msg", level: "error" }),
    ];
    storeState.filters = { service: "", level: "error", text: "" };
    render(<LogsPanel dict={dict} />);
    expect(screen.getByText("error msg")).toBeInTheDocument();
    expect(screen.queryByText("info msg")).toBeNull();
  });

  it("shows auto-scroll toggle button", () => {
    render(<LogsPanel dict={dict} />);
    expect(screen.getByText("Auto-scroll")).toBeInTheDocument();
  });

  it("calls toggleAutoScroll when toggle button is clicked", async () => {
    const user = userEvent.setup();
    render(<LogsPanel dict={dict} />);
    await user.click(screen.getByText("Auto-scroll"));
    expect(mockToggleAutoScroll).toHaveBeenCalledOnce();
  });

  it("renders a bottom sentinel element for auto-scroll", () => {
    const { container } = render(<LogsPanel dict={dict} />);
    expect(container.querySelector("[data-testid='scroll-sentinel']")).toBeInTheDocument();
  });

  it("calls setAutoScroll(false) when user scrolls up (not at bottom)", () => {
    storeState.autoScroll = true;
    const { container } = render(<LogsPanel dict={dict} />);

    // Find the scroll container
    const scrollContainer = container.querySelector("[data-testid='scroll-container']") as HTMLElement;
    expect(scrollContainer).toBeInTheDocument();

    // Simulate scroll-up: scrollTop + clientHeight < scrollHeight - threshold
    Object.defineProperty(scrollContainer, "scrollTop", { value: 0, configurable: true });
    Object.defineProperty(scrollContainer, "clientHeight", { value: 400, configurable: true });
    Object.defineProperty(scrollContainer, "scrollHeight", { value: 1000, configurable: true });

    fireEvent.scroll(scrollContainer);

    expect(mockSetAutoScroll).toHaveBeenCalledWith(false);
  });

  it("does not call setAutoScroll when user is at the bottom", () => {
    storeState.autoScroll = true;
    const { container } = render(<LogsPanel dict={dict} />);

    const scrollContainer = container.querySelector("[data-testid='scroll-container']") as HTMLElement;
    expect(scrollContainer).toBeInTheDocument();

    // At bottom: scrollTop + clientHeight >= scrollHeight - threshold
    Object.defineProperty(scrollContainer, "scrollTop", { value: 560, configurable: true });
    Object.defineProperty(scrollContainer, "clientHeight", { value: 400, configurable: true });
    Object.defineProperty(scrollContainer, "scrollHeight", { value: 1000, configurable: true });

    fireEvent.scroll(scrollContainer);

    expect(mockSetAutoScroll).not.toHaveBeenCalled();
  });
});
