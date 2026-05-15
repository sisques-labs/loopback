import { describe, expect, it } from "vitest";
import { buttonVariants } from "./button";

describe("buttonVariants", () => {
  it("does not use transition-all", () => {
    expect(buttonVariants()).not.toContain("transition-all");
  });

  it("animates theme-safe properties only", () => {
    expect(buttonVariants()).toContain(
      "transition-[background-color,border-color,box-shadow,transform,opacity]",
    );
  });
});
