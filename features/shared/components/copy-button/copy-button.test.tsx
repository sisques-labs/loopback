import { act, cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CopyButton } from "./copy-button";

const writeText = vi.fn();

beforeEach(() => {
  writeText.mockReset();
  // jsdom does not implement clipboard; install a per-test mock.
  Object.defineProperty(navigator, "clipboard", {
    configurable: true,
    value: { writeText },
  });
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe("CopyButton", () => {
  it("copies value to clipboard on click", async () => {
    writeText.mockResolvedValueOnce(undefined);
    render(
      <CopyButton
        value="arn:aws:sns:us-east-1:123:my-topic"
        copyLabel="Copy"
        copiedLabel="Copied"
      />,
    );
    await userEvent.click(screen.getByRole("button", { name: "Copy" }));
    expect(writeText).toHaveBeenCalledWith("arn:aws:sns:us-east-1:123:my-topic");
  });

  it("shows confirmation state (aria-label changes to copiedLabel) after click", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    writeText.mockResolvedValueOnce(undefined);
    render(
      <CopyButton value="test-value" copyLabel="Copy ARN" copiedLabel="ARN copied" />,
    );
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    await user.click(screen.getByRole("button", { name: "Copy ARN" }));
    // After click, aria-label should update to copiedLabel
    expect(await screen.findByRole("button", { name: "ARN copied" })).toBeInTheDocument();
    // After 1500ms it should revert — wrap in act so React flushes the state update
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1600);
    });
    expect(screen.getByRole("button", { name: "Copy ARN" })).toBeInTheDocument();
  });

  it("falls back gracefully when clipboard API unavailable", async () => {
    // Override clipboard to undefined
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: undefined,
    });
    // jsdom doesn't implement execCommand — define it so the fallback doesn't throw
    Object.defineProperty(document, "execCommand", {
      configurable: true,
      value: vi.fn().mockReturnValue(true),
    });

    render(
      <CopyButton value="some-value" copyLabel="Copy" copiedLabel="Copied" />,
    );
    // Should not throw
    await userEvent.click(screen.getByRole("button", { name: "Copy" }));
    // Restore
    Object.defineProperty(document, "execCommand", {
      configurable: true,
      value: undefined,
    });
  });

  it("logs a console.warn when clipboard API is unavailable", async () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: undefined,
    });
    Object.defineProperty(document, "execCommand", {
      configurable: true,
      value: vi.fn().mockReturnValue(true),
    });

    render(
      <CopyButton value="warn-value" copyLabel="Copy" copiedLabel="Copied" />,
    );
    await userEvent.click(screen.getByRole("button", { name: "Copy" }));
    expect(warnSpy).toHaveBeenCalledWith(
      "[CopyButton] clipboard unavailable, falling back to execCommand",
    );

    warnSpy.mockRestore();
    Object.defineProperty(document, "execCommand", {
      configurable: true,
      value: undefined,
    });
  });

  it("has aria-label for accessibility", () => {
    render(
      <CopyButton value="test" copyLabel="Copy URL" copiedLabel="URL copied" />,
    );
    const btn = screen.getByRole("button", { name: "Copy URL" });
    expect(btn).toHaveAttribute("aria-label", "Copy URL");
  });

  it("renders with label prop when provided", () => {
    render(
      <CopyButton
        value="test"
        copyLabel="Copy"
        copiedLabel="Copied"
        label="Copy ARN"
      />,
    );
    expect(screen.getByText("Copy ARN")).toBeInTheDocument();
  });

  it("renders in sm size variant with compact icon-xs class", () => {
    render(
      <CopyButton
        value="test"
        copyLabel="Copy"
        copiedLabel="Copied"
        size="sm"
      />,
    );
    const btn = screen.getByRole("button", { name: "Copy" });
    // size="sm" maps to Button size="icon-xs" which applies the "size-6" utility class
    expect(btn).toHaveClass("size-6");
  });

  it("renders with only required prop value", () => {
    render(
      <CopyButton
        value="arn:aws:sns:us-east-1:123456789012:my-topic"
        copyLabel="Copy"
        copiedLabel="Copied"
      />,
    );
    expect(screen.getByRole("button")).toBeInTheDocument();
  });
});
