import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { InspectorSkeleton } from "./inspector-skeleton";

afterEach(() => {
  cleanup();
});

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("InspectorSkeleton", () => {
  describe("list mode (withSpine=false)", () => {
    it("renders skeleton card items", () => {
      const { container } = render(<InspectorSkeleton withSpine={false} />);
      // Expect at least one skeleton placeholder element
      const items = container.querySelectorAll("[data-testid='skeleton-item']");
      expect(items.length).toBeGreaterThan(0);
    });

    it("does NOT render spine dots when withSpine is false", () => {
      const { container } = render(<InspectorSkeleton withSpine={false} />);
      expect(container.querySelector("[data-testid='spine-dot']")).not.toBeInTheDocument();
    });
  });

  describe("timeline mode (withSpine=true)", () => {
    it("renders skeleton card items with spine dots when withSpine is true", () => {
      const { container } = render(<InspectorSkeleton withSpine={true} />);
      const items = container.querySelectorAll("[data-testid='skeleton-item']");
      expect(items.length).toBeGreaterThan(0);
    });

    it("renders spine dots when withSpine is true", () => {
      const { container } = render(<InspectorSkeleton withSpine={true} />);
      const spineDots = container.querySelectorAll("[data-testid='spine-dot']");
      expect(spineDots.length).toBeGreaterThan(0);
    });

    it("spine dot count matches skeleton item count", () => {
      const { container } = render(<InspectorSkeleton withSpine={true} />);
      const items = container.querySelectorAll("[data-testid='skeleton-item']");
      const spineDots = container.querySelectorAll("[data-testid='spine-dot']");
      expect(spineDots.length).toBe(items.length);
    });
  });
});
