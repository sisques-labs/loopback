import { render, screen, cleanup } from "@testing-library/react";
import { describe, it, expect, afterEach } from "vitest";

afterEach(cleanup);

const dict = {
  empty: {
    title: "No events found",
    body: "No events were found for this time range. Try adjusting the time range or check your LocalStack configuration.",
  },
};

describe("TimelineEmpty", () => {
  it("renders the empty state title", async () => {
    const { TimelineEmpty } = await import("./timeline-empty");
    render(<TimelineEmpty dict={dict} />);
    expect(screen.getByText("No events found")).toBeInTheDocument();
  });

  it("renders the empty state body", async () => {
    const { TimelineEmpty } = await import("./timeline-empty");
    render(<TimelineEmpty dict={dict} />);
    expect(screen.getByText(dict.empty.body)).toBeInTheDocument();
  });
});
