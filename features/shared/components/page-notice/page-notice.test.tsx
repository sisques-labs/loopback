import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { PageNotice } from "./page-notice";

describe("PageNotice", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders without error with default variant (warning)", () => {
    render(<PageNotice>Test message</PageNotice>);
    expect(screen.getByRole("status")).toBeDefined();
  });

  it("renders all three variants without error", () => {
    const { unmount } = render(
      <PageNotice variant="warning">Warning</PageNotice>,
    );
    expect(screen.getByRole("status")).toBeDefined();
    unmount();

    const { unmount: unmount2 } = render(
      <PageNotice variant="info">Info</PageNotice>,
    );
    expect(screen.getByRole("status")).toBeDefined();
    unmount2();

    render(<PageNotice variant="error">Error</PageNotice>);
    expect(screen.getByRole("status")).toBeDefined();
  });

  it("sets role=status on the root element", () => {
    render(<PageNotice>Message</PageNotice>);
    expect(screen.getByRole("status")).toBeDefined();
  });

  it("sets aria-live=polite on the root element", () => {
    render(<PageNotice>Message</PageNotice>);
    const el = screen.getByRole("status");
    expect(el.getAttribute("aria-live")).toBe("polite");
  });

  it("renders the TriangleAlert icon for the warning variant by default", () => {
    const { container } = render(
      <PageNotice variant="warning">Warning</PageNotice>,
    );
    const icon = container.querySelector(".lucide-triangle-alert");
    expect(icon).not.toBeNull();
  });

  it("renders the Info icon for the info variant by default", () => {
    const { container } = render(
      <PageNotice variant="info">Info message</PageNotice>,
    );
    const icon = container.querySelector(".lucide-info");
    expect(icon).not.toBeNull();
  });

  it("renders a custom icon when icon prop is provided", () => {
    render(
      <PageNotice icon={<span data-testid="custom-icon" />}>Message</PageNotice>,
    );
    expect(screen.getByTestId("custom-icon")).toBeDefined();
  });

  it("renders children content", () => {
    render(<PageNotice>Hello operator</PageNotice>);
    expect(screen.getByRole("status").textContent).toContain("Hello operator");
  });

  it("includes min-h-11 class on root element (mobile touch region)", () => {
    render(<PageNotice>Message</PageNotice>);
    const el = screen.getByRole("status");
    expect(el.className).toContain("min-h-11");
  });

  it("merges className prop onto the root element", () => {
    render(<PageNotice className="mt-4">Message</PageNotice>);
    const el = screen.getByRole("status");
    expect(el.className).toContain("mt-4");
  });
});
