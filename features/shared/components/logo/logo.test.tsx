import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { Logo } from "./logo";

describe("Logo", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders the Loopback wordmark text", () => {
    render(<Logo />);
    expect(screen.getByText("Loopback")).toBeInTheDocument();
  });

  it("renders an inline SVG mark", () => {
    const { container } = render(<Logo />);
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
  });

  it("SVG mark has two bracket paths", () => {
    const { container } = render(<Logo />);
    const paths = container.querySelectorAll("svg path");
    expect(paths).toHaveLength(2);
  });

  it("applies default size of 20 to SVG", () => {
    const { container } = render(<Logo />);
    const svg = container.querySelector("svg");
    expect(svg).toHaveAttribute("width", "20");
    expect(svg).toHaveAttribute("height", "20");
  });

  it("applies custom size when provided", () => {
    const { container } = render(<Logo size={32} />);
    const svg = container.querySelector("svg");
    expect(svg).toHaveAttribute("width", "32");
    expect(svg).toHaveAttribute("height", "32");
  });
});
