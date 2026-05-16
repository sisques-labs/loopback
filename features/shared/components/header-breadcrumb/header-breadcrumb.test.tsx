import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { HeaderBreadcrumb } from "./header-breadcrumb";

vi.mock("next/navigation", () => ({
  usePathname: () => "/en/dynamodb/test-table",
}));

describe("HeaderBreadcrumb", () => {
  afterEach(() => {
    cleanup();
  });

  it("uses 44px height touch targets; min-width from sm breakpoint", () => {
    render(
      <HeaderBreadcrumb locale="en" settingsLabel="Settings" />,
    );

    const serviceLink = screen.getByRole("link", { name: "DynamoDB" });
    expect(serviceLink.className).toContain("min-h-11");
    expect(serviceLink.className).toContain("sm:min-w-11");

    const currentPage = screen.getByRole("link", { name: "test-table" });
    expect(currentPage.className).toContain("min-h-11");
    expect(currentPage.className).toContain("sm:min-w-11");
  });

  it("hides separators below sm so mobile shows only the current crumb", () => {
    const { container } = render(
      <HeaderBreadcrumb locale="en" settingsLabel="Settings" />,
    );

    const separator = container.querySelector(
      '[data-slot="breadcrumb-separator"]',
    );
    expect(separator?.className).toContain("hidden");
    expect(separator?.className).toContain("sm:inline-flex");
  });
});
