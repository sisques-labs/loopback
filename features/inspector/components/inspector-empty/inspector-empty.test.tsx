import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { InspectorEmpty } from "./inspector-empty";

// ── Fixtures ──────────────────────────────────────────────────────────────────

const dict = {
  empty: {
    title: "No requests yet",
    body: "AWS SDK calls made by Server Actions will appear here.",
  },
};

afterEach(() => {
  cleanup();
});

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("InspectorEmpty", () => {
  it("renders the empty title", () => {
    render(<InspectorEmpty dict={dict} />);
    expect(screen.getByText("No requests yet")).toBeInTheDocument();
  });

  it("renders the empty body text", () => {
    render(<InspectorEmpty dict={dict} />);
    expect(
      screen.getByText("AWS SDK calls made by Server Actions will appear here."),
    ).toBeInTheDocument();
  });

  it("renders a SearchX icon (svg element present)", () => {
    const { container } = render(<InspectorEmpty dict={dict} />);
    expect(container.querySelector("svg")).toBeInTheDocument();
  });
});
