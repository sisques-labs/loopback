import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TableSkeleton } from "./table-skeleton";

describe("TableSkeleton", () => {
  it("renders with default 5 rows and 4 columns", () => {
    const { container } = render(<TableSkeleton />);
    // 5 body rows
    const bodyRows = container.querySelectorAll("tbody tr");
    expect(bodyRows).toHaveLength(5);
    // each body row has 4 cells
    expect(bodyRows[0].querySelectorAll("td")).toHaveLength(4);
  });

  it("renders with custom rows prop", () => {
    const { container } = render(<TableSkeleton rows={3} columns={4} />);
    const bodyRows = container.querySelectorAll("tbody tr");
    expect(bodyRows).toHaveLength(3);
  });

  it("renders with custom columns prop", () => {
    const { container } = render(<TableSkeleton rows={5} columns={6} />);
    const bodyRows = container.querySelectorAll("tbody tr");
    expect(bodyRows[0].querySelectorAll("td")).toHaveLength(6);
  });

  it("each cell contains a Skeleton element", () => {
    const { container } = render(<TableSkeleton rows={2} columns={2} />);
    const cells = container.querySelectorAll("tbody td");
    cells.forEach((cell) => {
      const skeleton = cell.querySelector("[data-slot='skeleton']");
      expect(skeleton).toBeTruthy();
    });
  });
});
