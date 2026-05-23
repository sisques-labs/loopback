import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { DetailSkeleton } from "./detail-skeleton";

describe("DetailSkeleton", () => {
  it("renders a header skeleton", () => {
    const { container } = render(<DetailSkeleton />);
    const header = container.querySelector("[data-slot='skeleton-header']");
    expect(header).toBeTruthy();
  });

  it("renders key/value row skeletons with default count of 6", () => {
    const { container } = render(<DetailSkeleton />);
    const rows = container.querySelectorAll("[data-slot='skeleton-row']");
    expect(rows).toHaveLength(6);
  });

  it("renders custom number of key/value rows via rows prop", () => {
    const { container } = render(<DetailSkeleton rows={3} />);
    const rows = container.querySelectorAll("[data-slot='skeleton-row']");
    expect(rows).toHaveLength(3);
  });
});
