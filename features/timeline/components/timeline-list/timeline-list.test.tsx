import { render, screen, cleanup } from "@testing-library/react";
import { describe, it, expect, afterEach } from "vitest";
import type { TimelineEvent } from "../../lib/types/types";

// ── Fixture helpers ────────────────────────────────────────────────────────────

function makeEvent(overrides: Partial<TimelineEvent> = {}): TimelineEvent {
  return {
    eventId: "evt-1",
    timestamp: 1700000000000,
    message: "Default message",
    level: "info",
    service: "lambda",
    logGroupName: "/aws/lambda/my-fn",
    ...overrides,
  };
}

afterEach(cleanup);

// ── Tests ──────────────────────────────────────────────────────────────────────

describe("TimelineList", () => {
  it("renders one card per event", async () => {
    const { TimelineList } = await import("./timeline-list");
    const events = [
      makeEvent({ eventId: "evt-1", message: "First event" }),
      makeEvent({ eventId: "evt-2", message: "Second event" }),
      makeEvent({ eventId: "evt-3", message: "Third event" }),
    ];
    render(<TimelineList events={events} />);
    expect(screen.getByText("First event")).toBeInTheDocument();
    expect(screen.getByText("Second event")).toBeInTheDocument();
    expect(screen.getByText("Third event")).toBeInTheDocument();
  });

  it("renders nothing (empty list) when events array is empty", async () => {
    const { TimelineList } = await import("./timeline-list");
    const { container } = render(<TimelineList events={[]} />);
    // No event cards rendered
    expect(container.querySelectorAll("[data-event-id]").length).toBe(0);
  });

  it("renders events in the order provided (desc timestamp)", async () => {
    const { TimelineList } = await import("./timeline-list");
    const events = [
      makeEvent({ eventId: "evt-a", message: "Newer", timestamp: 1700000002000 }),
      makeEvent({ eventId: "evt-b", message: "Older", timestamp: 1700000001000 }),
    ];
    const { container } = render(<TimelineList events={events} />);
    const cards = container.querySelectorAll("[data-event-id]");
    expect(cards[0].getAttribute("data-event-id")).toBe("evt-a");
    expect(cards[1].getAttribute("data-event-id")).toBe("evt-b");
  });
});
