import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CardGridSkeleton } from "./card-grid-skeleton";

describe("CardGridSkeleton", () => {
  it("renders 6 cards by default", () => {
    const { container } = render(<CardGridSkeleton />);
    const cards = container.querySelectorAll("[data-slot='skeleton-card']");
    expect(cards).toHaveLength(6);
  });

  it("renders custom number of cards via items prop", () => {
    const { container } = render(<CardGridSkeleton items={3} />);
    const cards = container.querySelectorAll("[data-slot='skeleton-card']");
    expect(cards).toHaveLength(3);
  });
});
