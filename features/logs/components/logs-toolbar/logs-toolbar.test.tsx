import type { LogsDict } from "@/features/logs/i18n/en";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

// ── Mock useLogsStore ────────────────────────────────────────────────────────

const mockSetFilter = vi.fn();

vi.mock("@/features/shared/stores/use-logs-store", () => ({
  useLogsStore: vi.fn(() => ({
    filters: { service: "", level: "all", text: "" },
    setFilter: mockSetFilter,
  })),
}));

import { LogsToolbar } from "./logs-toolbar";

// ── Dict fixture ──────────────────────────────────────────────────────────────

const dict: Pick<LogsDict, "filters"> = {
  filters: {
    service: "Service",
    level: "Level",
    allServices: "All services",
    allLevels: "All levels",
  },
};

const services = ["lambda", "s3"];

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

// ── Tests ────────────────────────────────────────────────────────────────────

describe("LogsToolbar", () => {
  it("renders service select trigger", () => {
    render(<LogsToolbar dict={dict} services={services} />);
    expect(screen.getByText("All services")).toBeInTheDocument();
  });

  it("renders level select trigger", () => {
    render(<LogsToolbar dict={dict} services={services} />);
    expect(screen.getByText("All levels")).toBeInTheDocument();
  });

  it("shows service filter label", () => {
    render(<LogsToolbar dict={dict} services={services} />);
    expect(screen.getByText("Service")).toBeInTheDocument();
  });

  it("shows level filter label", () => {
    render(<LogsToolbar dict={dict} services={services} />);
    expect(screen.getByText("Level")).toBeInTheDocument();
  });

  it("renders without crashing when no services are passed", () => {
    render(<LogsToolbar dict={dict} services={[]} />);
    expect(screen.getByText("All services")).toBeInTheDocument();
  });
});
