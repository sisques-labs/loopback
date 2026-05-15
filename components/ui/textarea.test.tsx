import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Textarea } from "./textarea";

describe("Textarea", () => {
  it("uses token border and focus ring classes", () => {
    render(<Textarea aria-label="Body" />);
    const field = screen.getByRole("textbox", { name: "Body" });
    expect(field.className).toContain("border-input");
    expect(field.className).toContain("focus-visible:ring-ring/50");
  });

  it("defaults to four rows", () => {
    render(<Textarea aria-label="Notes" />);
    expect(screen.getByRole("textbox", { name: "Notes" })).toHaveAttribute(
      "rows",
      "4",
    );
  });
});
