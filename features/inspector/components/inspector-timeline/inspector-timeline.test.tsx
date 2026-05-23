import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { RequestEntry } from "@/features/inspector/lib/types/types";

// ── Mocks ─────────────────────────────────────────────────────────────────────

vi.mock("@/features/inspector/components/request-card/request-card", () => ({
  RequestCard: ({ entry }: { entry: RequestEntry }) => (
    <div data-testid="request-card" data-id={entry.id} />
  ),
}));

import { InspectorTimeline } from "./inspector-timeline";

// ── Fixtures ──────────────────────────────────────────────────────────────────

const dict = {
  card: { duration: "{ms}ms", attempts: "{n} attempts", retries: "{n} retries" },
};

function makeEntry(id: string, timestamp: number): RequestEntry {
  return {
    id,
    timestamp,
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
});

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("InspectorTimeline", () => {
  it("renders one RequestCard per entry", () => {
    const entries = [
      makeEntry("e1", 1000),
      makeEntry("e2", 2000),
      makeEntry("e3", 3000),
    ];
    render(<InspectorTimeline entries={entries} dict={dict} />);
    expect(screen.getAllByTestId("request-card")).toHaveLength(3);
  });

  it("renders entries sorted descending by timestamp (newest first)", () => {
    const entries = [
      makeEntry("e1", 1000),
      makeEntry("e3", 3000),
      makeEntry("e2", 2000),
    ];
    render(<InspectorTimeline entries={entries} dict={dict} />);
    const cards = screen.getAllByTestId("request-card");
    // e3 (timestamp=3000) must appear first
    expect(cards[0].getAttribute("data-id")).toBe("e3");
    expect(cards[1].getAttribute("data-id")).toBe("e2");
    expect(cards[2].getAttribute("data-id")).toBe("e1");
  });

  it("renders a spine container (flex gap structure) for each entry", () => {
    const entries = [makeEntry("e1", 1000), makeEntry("e2", 2000)];
    const { container } = render(<InspectorTimeline entries={entries} dict={dict} />);
    // Each entry is wrapped in a flex row with gap — verify spine dots are rendered
    const spineDots = container.querySelectorAll("[data-testid='spine-dot']");
    expect(spineDots.length).toBe(2);
  });

  it("renders nothing when entries is empty", () => {
    const { container } = render(<InspectorTimeline entries={[]} dict={dict} />);
    expect(container.querySelectorAll("[data-testid='request-card']")).toHaveLength(0);
  });
});
