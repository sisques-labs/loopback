import { render, screen, cleanup } from "@testing-library/react";
import { describe, it, expect, afterEach } from "vitest";
import type { TimelineEvent } from "../../lib/types/types";

// ── Fixture helpers ────────────────────────────────────────────────────────────

function makeEvent(overrides: Partial<TimelineEvent> = {}): TimelineEvent {
  return {
    eventId: "evt-1",
    timestamp: 1700000000000,
    message: "Lambda function invoked successfully",
    level: "info",
    service: "lambda",
    logGroupName: "/aws/lambda/my-fn",
    ...overrides,
  };
}

// ── Tests ──────────────────────────────────────────────────────────────────────

afterEach(cleanup);

describe("TimelineCard", () => {
  it("renders the event message text", async () => {
    const { TimelineCard } = await import("./timeline-card");
    const event = makeEvent({ message: "S3 object uploaded" });
    render(<TimelineCard event={event} />);
    expect(screen.getByText("S3 object uploaded")).toBeInTheDocument();
  });

  it("renders a service badge with the service name", async () => {
    const { TimelineCard } = await import("./timeline-card");
    const event = makeEvent({ service: "s3" });
    render(<TimelineCard event={event} />);
    expect(screen.getByText("s3")).toBeInTheDocument();
  });

  it("applies service-color badge class from getServiceColorClasses", async () => {
    const { TimelineCard } = await import("./timeline-card");
    const event = makeEvent({ service: "lambda" });
    const { container } = render(<TimelineCard event={event} />);
    // lambda badge class includes bg-blue-500/10
    const badge = container.querySelector("[data-service-badge]");
    expect(badge).toBeInTheDocument();
    expect(badge?.className).toContain("bg-blue-500/10");
  });

  it("renders the timestamp in human-readable form (not raw epoch)", async () => {
    const { TimelineCard } = await import("./timeline-card");
    const event = makeEvent({ timestamp: 1700000000000 });
    render(<TimelineCard event={event} />);
    // Raw epoch number should NOT appear
    expect(screen.queryByText("1700000000000")).toBeNull();
    // Some rendered timestamp exists
    expect(screen.getByTestId("timeline-card-timestamp")).toBeInTheDocument();
  });

  it("applies error styling when level is 'error'", async () => {
    const { TimelineCard } = await import("./timeline-card");
    const event = makeEvent({ level: "error" });
    const { container } = render(<TimelineCard event={event} />);
    const card = container.querySelector("[data-level='error']");
    expect(card).toBeInTheDocument();
  });

  it("applies warn styling when level is 'warn'", async () => {
    const { TimelineCard } = await import("./timeline-card");
    const event = makeEvent({ level: "warn" });
    const { container } = render(<TimelineCard event={event} />);
    const card = container.querySelector("[data-level='warn']");
    expect(card).toBeInTheDocument();
  });

  it("renders with 'info' level by default (no special error classes)", async () => {
    const { TimelineCard } = await import("./timeline-card");
    const event = makeEvent({ level: "info" });
    const { container } = render(<TimelineCard event={event} />);
    const card = container.querySelector("[data-level='info']");
    expect(card).toBeInTheDocument();
  });

  it("renders timeline card spine node element", async () => {
    const { TimelineCard } = await import("./timeline-card");
    const event = makeEvent();
    const { container } = render(<TimelineCard event={event} />);
    const spine = container.querySelector("[data-spine-node]");
    expect(spine).toBeInTheDocument();
  });
});
