import { cleanup, render, screen, fireEvent } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { InspectorDict } from "@/features/inspector/i18n/en";
import type { WidenStringLiterals } from "@/features/shared/i18n/widen-literals";

// ── Mocks ─────────────────────────────────────────────────────────────────────

const mockSetFilter = vi.fn();
const mockClearBuffer = vi.fn().mockResolvedValue(undefined);
const mockSetView = vi.fn();

// mockView holds the current view for the mock store
const mockState = { view: "list" as "list" | "timeline" };

vi.mock(
  "@/features/inspector/stores/use-inspector-store/use-inspector-store",
  () => ({
    useInspectorStore: vi.fn(() => ({
      filters: { service: "", status: "all", text: "" },
      status: "idle",
      lastUpdatedAt: null,
      view: mockState.view,
      setFilter: mockSetFilter,
      clearBuffer: mockClearBuffer,
      setView: mockSetView,
    })),
  }),
);

// Mock Select components to avoid jsdom limitations with portals
vi.mock("@/components/ui/select", () => ({
  Select: ({ children, onValueChange }: { children: React.ReactNode; onValueChange?: (v: string) => void; value?: string }) =>
    <div data-testid="select" onClick={() => onValueChange?.("DynamoDB")}>{children}</div>,
  SelectTrigger: ({ children }: { children: React.ReactNode }) => <div data-testid="select-trigger">{children}</div>,
  SelectValue: ({ children }: { children?: React.ReactNode }) => <span>{children}</span>,
  SelectContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SelectItem: ({ children, value }: { children: React.ReactNode; value: string }) =>
    <div data-value={value}>{children}</div>,
}));

import { InspectorToolbar } from "./inspector-toolbar";

// ── Fixtures ──────────────────────────────────────────────────────────────────

type ToolbarDict = Pick<WidenStringLiterals<InspectorDict>, "toolbar">;

const dict: ToolbarDict = {
  toolbar: {
    filters: {
      service: {
        label: "Service",
        all: "All services",
      },
      status: {
        label: "Status",
        all: "All",
        success: "Success",
        error: "Error",
      },
      text: {
        placeholder: "Search…",
      },
    },
    view: {
      label: "View",
      list: "List",
      timeline: "Timeline",
    },
    clearBuffer: "Clear",
    statusPolling: "Live",
    statusError: "Error",
    statusIdle: "Idle",
    lastUpdated: "Updated {time} ago",
  },
};

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  mockState.view = "list";
});

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("InspectorToolbar", () => {
  it("renders the service filter label", () => {
    render(<InspectorToolbar dict={dict} services={["SQS", "DynamoDB"]} />);
    expect(screen.getByText("Service")).toBeInTheDocument();
  });

  it("renders the status filter label", () => {
    render(<InspectorToolbar dict={dict} services={[]} />);
    expect(screen.getByText("Status")).toBeInTheDocument();
  });

  it("renders the clear buffer button", () => {
    render(<InspectorToolbar dict={dict} services={[]} />);
    expect(screen.getByRole("button", { name: /clear/i })).toBeInTheDocument();
  });

  it("calls clearBuffer when clear button is clicked", async () => {
    render(<InspectorToolbar dict={dict} services={[]} />);
    fireEvent.click(screen.getByRole("button", { name: /clear/i }));
    expect(mockClearBuffer).toHaveBeenCalledOnce();
  });

  it("clear button has min-h-11 touch target", () => {
    render(<InspectorToolbar dict={dict} services={[]} />);
    const btn = screen.getByRole("button", { name: /clear/i });
    // Check that the button has min-h-11 applied (via className)
    expect(btn.className).toMatch(/min-h-11/);
  });

  it("shows the service filter all-services option", () => {
    render(<InspectorToolbar dict={dict} services={[]} />);
    // "All services" appears in both trigger and dropdown item
    expect(screen.getAllByText("All services").length).toBeGreaterThanOrEqual(1);
  });

  it("shows status filter all option", () => {
    render(<InspectorToolbar dict={dict} services={[]} />);
    // "All" appears in both trigger and dropdown item
    expect(screen.getAllByText("All").length).toBeGreaterThanOrEqual(1);
  });

  describe("view toggle", () => {
    it("renders List and Timeline toggle buttons", () => {
      mockState.view = "list";
      render(<InspectorToolbar dict={dict} services={[]} />);
      expect(screen.getByRole("tab", { name: /^list$/i })).toBeInTheDocument();
      expect(screen.getByRole("tab", { name: /^timeline$/i })).toBeInTheDocument();
    });

    it("List button has aria-pressed=true when view is list", () => {
      mockState.view = "list";
      render(<InspectorToolbar dict={dict} services={[]} />);
      expect(screen.getByRole("tab", { name: /^list$/i })).toHaveAttribute(
        "aria-pressed",
        "true",
      );
    });

    it("Timeline button has aria-pressed=false when view is list", () => {
      mockState.view = "list";
      render(<InspectorToolbar dict={dict} services={[]} />);
      expect(screen.getByRole("tab", { name: /^timeline$/i })).toHaveAttribute(
        "aria-pressed",
        "false",
      );
    });

    it("Timeline button has aria-pressed=true when view is timeline", () => {
      mockState.view = "timeline";
      render(<InspectorToolbar dict={dict} services={[]} />);
      expect(screen.getByRole("tab", { name: /^timeline$/i })).toHaveAttribute(
        "aria-pressed",
        "true",
      );
    });

    it("clicking List button calls setView('list')", () => {
      mockState.view = "timeline";
      render(<InspectorToolbar dict={dict} services={[]} />);
      fireEvent.click(screen.getByRole("tab", { name: /^list$/i }));
      expect(mockSetView).toHaveBeenCalledWith("list");
    });

    it("clicking Timeline button calls setView('timeline')", () => {
      mockState.view = "list";
      render(<InspectorToolbar dict={dict} services={[]} />);
      fireEvent.click(screen.getByRole("tab", { name: /^timeline$/i }));
      expect(mockSetView).toHaveBeenCalledWith("timeline");
    });
  });
});
