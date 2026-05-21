import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { JsonViewer } from "./json-viewer";

const writeText = vi.fn();

beforeEach(() => {
  writeText.mockReset();
  Object.defineProperty(navigator, "clipboard", {
    configurable: true,
    value: { writeText },
  });
});

afterEach(() => {
  cleanup();
});

describe("JsonViewer", () => {
  it("renders formatted JSON when passed a valid JSON string", () => {
    render(
      <JsonViewer
        value='{"a":1}'
        copyLabel="Copy JSON"
        copiedLabel="Copied"
      />,
    );

    expect(screen.getByRole("code")).toHaveTextContent(
      '{\n  "a": 1\n}',
      { normalizeWhitespace: false },
    );
  });

  it("renders formatted JSON when passed an object", () => {
    render(
      <JsonViewer
        value={{ key: "val" }}
        copyLabel="Copy JSON"
        copiedLabel="Copied"
      />,
    );

    expect(screen.getByRole("code")).toHaveTextContent(
      '{\n  "key": "val"\n}',
      { normalizeWhitespace: false },
    );
  });

  it("contains a CopyButton with an accessible label", () => {
    render(
      <JsonViewer
        value='{"a":1}'
        copyLabel="Copy JSON"
        copiedLabel="Copied"
      />,
    );

    expect(
      screen.getByRole("button", { name: "Copy JSON" }),
    ).toBeInTheDocument();
  });

  it("renders in a monospace container with overflow-auto", () => {
    render(
      <JsonViewer
        value='{"a":1}'
        copyLabel="Copy JSON"
        copiedLabel="Copied"
      />,
    );

    const pre = screen.getByRole("code");
    expect(pre.className).toMatch(/font-mono/);
    expect(pre.className).toMatch(/overflow-auto/);
  });

  it("applies maxHeight style when maxHeight prop is provided", () => {
    render(
      <JsonViewer
        value='{"a":1}'
        maxHeight="200px"
        copyLabel="Copy JSON"
        copiedLabel="Copied"
      />,
    );

    const pre = screen.getByRole("code");
    expect(pre).toHaveStyle({ maxHeight: "200px" });
  });

  it("renders raw string when value is not valid JSON", () => {
    render(
      <JsonViewer
        value="plain text"
        copyLabel="Copy JSON"
        copiedLabel="Copied"
      />,
    );

    expect(screen.getByRole("code")).toHaveTextContent("plain text");
  });
});
