import { render, screen, cleanup } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { describe, it, expect, afterEach, vi } from "vitest";
import type { TimelineTimeRange, TimelineStoreStatus } from "../../lib/types/types";

// ── Dict fixture ───────────────────────────────────────────────────────────────

const dict = {
  toolbar: {
    timeRange: {
      label: "Time range",
      "1h": "Last 1 hour",
      "6h": "Last 6 hours",
      "24h": "Last 24 hours",
      all: "All time",
    },
    statusPolling: "Polling",
    statusError: "Error",
    statusIdle: "Idle",
    lastUpdated: "Updated {time}",
  },
};

afterEach(cleanup);

// ── Tests ──────────────────────────────────────────────────────────────────────

describe("TimelineToolbar", () => {
  it("renders all 4 time-range options", async () => {
    const { TimelineToolbar } = await import("./timeline-toolbar");
    render(
      <TimelineToolbar
        dict={dict}
        status="idle"
        lastUpdatedAt={null}
        timeRange="1h"
        onTimeRangeChange={vi.fn()}
      />
    );
    // All 4 option labels should be present (may be in select options)
    expect(screen.getByText("Last 1 hour")).toBeInTheDocument();
    expect(screen.getByText("Last 6 hours")).toBeInTheDocument();
    expect(screen.getByText("Last 24 hours")).toBeInTheDocument();
    expect(screen.getByText("All time")).toBeInTheDocument();
  });

  it("calls onTimeRangeChange when a different option is selected", async () => {
    const { TimelineToolbar } = await import("./timeline-toolbar");
    const onTimeRangeChange = vi.fn();
    const user = userEvent.setup();

    render(
      <TimelineToolbar
        dict={dict}
        status="idle"
        lastUpdatedAt={null}
        timeRange="1h"
        onTimeRangeChange={onTimeRangeChange}
      />
    );

    const select = screen.getByRole("combobox");
    await user.selectOptions(select, "6h");
    expect(onTimeRangeChange).toHaveBeenCalledWith("6h" as TimelineTimeRange);
  });

  it("shows 'Polling' status text when status is polling", async () => {
    const { TimelineToolbar } = await import("./timeline-toolbar");
    render(
      <TimelineToolbar
        dict={dict}
        status={"polling" as TimelineStoreStatus}
        lastUpdatedAt={null}
        timeRange="1h"
        onTimeRangeChange={vi.fn()}
      />
    );
    expect(screen.getByText("Polling")).toBeInTheDocument();
  });

  it("shows 'Error' status text when status is error", async () => {
    const { TimelineToolbar } = await import("./timeline-toolbar");
    render(
      <TimelineToolbar
        dict={dict}
        status={"error" as TimelineStoreStatus}
        lastUpdatedAt={null}
        timeRange="1h"
        onTimeRangeChange={vi.fn()}
      />
    );
    expect(screen.getByText("Error")).toBeInTheDocument();
  });

  it("shows 'Idle' status text when status is idle", async () => {
    const { TimelineToolbar } = await import("./timeline-toolbar");
    render(
      <TimelineToolbar
        dict={dict}
        status={"idle" as TimelineStoreStatus}
        lastUpdatedAt={null}
        timeRange="1h"
        onTimeRangeChange={vi.fn()}
      />
    );
    expect(screen.getByText("Idle")).toBeInTheDocument();
  });

  it("select has min-h-11 touch target class", async () => {
    const { TimelineToolbar } = await import("./timeline-toolbar");
    const { container } = render(
      <TimelineToolbar
        dict={dict}
        status="idle"
        lastUpdatedAt={null}
        timeRange="1h"
        onTimeRangeChange={vi.fn()}
      />
    );
    // The select wrapper should have touch target classes
    const touchTarget = container.querySelector(".min-h-11");
    expect(touchTarget).toBeInTheDocument();
  });

  it("shows label for time range selector", async () => {
    const { TimelineToolbar } = await import("./timeline-toolbar");
    render(
      <TimelineToolbar
        dict={dict}
        status="idle"
        lastUpdatedAt={null}
        timeRange="1h"
        onTimeRangeChange={vi.fn()}
      />
    );
    expect(screen.getByText("Time range")).toBeInTheDocument();
  });
});
