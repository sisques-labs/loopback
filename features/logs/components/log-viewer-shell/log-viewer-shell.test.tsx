import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { LogViewerShellDict } from "./log-viewer-shell";

// ── Mock useLogsStore ────────────────────────────────────────────────────────

const mockStartPolling = vi.fn();
const mockStopPolling = vi.fn();

const storeState = {
  status: "idle" as "idle" | "polling" | "error",
  lastUpdatedAt: null as number | null,
  entries: [],
  filters: { service: "", level: "all" as const, text: "" },
  autoScroll: true,
  toggleAutoScroll: vi.fn(),
  startPolling: mockStartPolling,
  stopPolling: mockStopPolling,
  setFilter: vi.fn(),
};

vi.mock("@/features/logs/stores/use-logs-store/use-logs-store", () => ({
  useLogsStore: vi.fn(() => storeState),
}));

// ── Mock sub-components to isolate shell ─────────────────────────────────────

vi.mock("@/features/logs/components/logs-toolbar/logs-toolbar", () => ({
  LogsToolbar: () => <div data-testid="logs-toolbar" />,
}));

vi.mock("@/features/logs/components/log-search/log-search", () => ({
  LogSearch: () => <div data-testid="log-search" />,
}));

vi.mock("@/features/logs/components/logs-panel/logs-panel", () => ({
  LogsPanel: () => <div data-testid="logs-panel" />,
}));

// jsdom scrollIntoView stub
Element.prototype.scrollIntoView = vi.fn();

import { LogViewerShell } from "./log-viewer-shell";

// ── Dict fixture ──────────────────────────────────────────────────────────────

const dict = {
  title: "CloudWatch Logs",
  description: "Stream logs",
  filters: {
    service: "Service",
    level: "Level",
    allServices: "All services",
    allLevels: "All levels",
  },
  search: { placeholder: "Search...", label: "Search" },
  entry: {
    level: { info: "INFO", warn: "WARN", error: "ERROR", unknown: "UNKNOWN" },
  },
  autoScroll: { enable: "Auto-scroll" },
  empty: "No log entries",
  noMatch: "No matches for current filters",
  updatedAt: "Updated {time} ago",
  status: { idle: "Not connected", polling: "Live", error: "Connection error" },
  errors: { fetchFailed: "Failed to fetch logs" },
  actions: { clearBuffer: "Clear logs" },
} as LogViewerShellDict;

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  storeState.status = "idle";
  storeState.lastUpdatedAt = null;
});

// ── Tests ────────────────────────────────────────────────────────────────────

describe("LogViewerShell", () => {
  it("calls startPolling on mount", () => {
    render(<LogViewerShell dict={dict} services={[]} />);
    expect(mockStartPolling).toHaveBeenCalledOnce();
  });

  it("calls stopPolling on unmount", () => {
    const { unmount } = render(<LogViewerShell dict={dict} services={[]} />);
    unmount();
    expect(mockStopPolling).toHaveBeenCalledOnce();
  });

  it("renders LogsToolbar", () => {
    render(<LogViewerShell dict={dict} services={[]} />);
    expect(screen.getByTestId("logs-toolbar")).toBeInTheDocument();
  });

  it("renders LogSearch", () => {
    render(<LogViewerShell dict={dict} services={[]} />);
    expect(screen.getByTestId("log-search")).toBeInTheDocument();
  });

  it("renders LogsPanel", () => {
    render(<LogViewerShell dict={dict} services={[]} />);
    expect(screen.getByTestId("logs-panel")).toBeInTheDocument();
  });

  it("shows 'Live' status indicator when status is polling", () => {
    storeState.status = "polling";
    render(<LogViewerShell dict={dict} services={[]} />);
    expect(screen.getByText("Live")).toBeInTheDocument();
  });

  it("shows error message when status is error", () => {
    storeState.status = "error";
    render(<LogViewerShell dict={dict} services={[]} />);
    expect(screen.getByText("Connection error")).toBeInTheDocument();
  });

  it("shows idle status when status is idle", () => {
    storeState.status = "idle";
    render(<LogViewerShell dict={dict} services={[]} />);
    expect(screen.getByText("Not connected")).toBeInTheDocument();
  });

  it("shows page title", () => {
    render(<LogViewerShell dict={dict} services={[]} />);
    expect(screen.getByText("CloudWatch Logs")).toBeInTheDocument();
  });
});
