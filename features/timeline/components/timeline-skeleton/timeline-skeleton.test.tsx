import { render, cleanup } from "@testing-library/react";
import { describe, it, expect, afterEach } from "vitest";

afterEach(cleanup);

describe("TimelineSkeleton", () => {
  it("renders 5 skeleton items by default", async () => {
    const { TimelineSkeleton } = await import("./timeline-skeleton");
    const { container } = render(<TimelineSkeleton />);
    const skeletons = container.querySelectorAll("[data-skeleton-item]");
    expect(skeletons.length).toBe(5);
  });

  it("renders the specified count of skeleton items", async () => {
    const { TimelineSkeleton } = await import("./timeline-skeleton");
    const { container } = render(<TimelineSkeleton count={3} />);
    const skeletons = container.querySelectorAll("[data-skeleton-item]");
    expect(skeletons.length).toBe(3);
  });

  it("renders skeleton shimmer elements (animate-pulse)", async () => {
    const { TimelineSkeleton } = await import("./timeline-skeleton");
    const { container } = render(<TimelineSkeleton count={1} />);
    const pulse = container.querySelector(".animate-pulse");
    expect(pulse).toBeInTheDocument();
  });
});
