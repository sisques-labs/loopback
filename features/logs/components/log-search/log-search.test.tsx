import { render, screen, cleanup } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { describe, it, expect, vi, afterEach } from "vitest";
import type { LogsDict } from "@/features/logs/i18n/en";

// ── Mock useLogsStore ────────────────────────────────────────────────────────

const mockSetFilter = vi.fn();

vi.mock("@/features/logs/stores/use-logs-store/use-logs-store", () => ({
  useLogsStore: vi.fn(() => ({
    filters: { service: "", level: "all", text: "" },
    setFilter: mockSetFilter,
  })),
}));

import { LogSearch } from "./log-search";

// ── Dict fixture ──────────────────────────────────────────────────────────────

const dict: Pick<LogsDict, "search"> = {
  search: {
    placeholder: "Search logs...",
    label: "Search",
  },
};

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

// ── Tests ────────────────────────────────────────────────────────────────────

describe("LogSearch", () => {
  it("renders a text input", () => {
    render(<LogSearch dict={dict} />);
    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });

  it("renders placeholder text", () => {
    render(<LogSearch dict={dict} />);
    expect(screen.getByPlaceholderText("Search logs...")).toBeInTheDocument();
  });

  it("calls setFilter('text', value) when user types", async () => {
    const user = userEvent.setup();
    render(<LogSearch dict={dict} />);
    const input = screen.getByRole("textbox");
    await user.type(input, "error");
    expect(mockSetFilter).toHaveBeenCalledWith("text", expect.stringContaining("e"));
  });

  it("calls setFilter with 'text' as the key on every change", async () => {
    const user = userEvent.setup();
    render(<LogSearch dict={dict} />);
    const input = screen.getByRole("textbox");
    await user.type(input, "x");
    // Every onChange call must pass "text" as the first argument
    for (const call of mockSetFilter.mock.calls) {
      expect(call[0]).toBe("text");
    }
  });
});
