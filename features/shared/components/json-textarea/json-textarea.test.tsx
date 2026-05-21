import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { JsonTextarea } from "./json-textarea";

describe("JsonTextarea", () => {
  afterEach(() => {
    cleanup();
  });

  it("empty input: no error shown, Format disabled, aria-invalid not true", () => {
    render(<JsonTextarea name="body" label="Body" />);

    expect(screen.queryByText("Invalid JSON")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Format JSON" })).toBeDisabled();
    expect(screen.getByLabelText("Body")).not.toHaveAttribute("aria-invalid", "true");
  });

  it("invalid JSON (non-empty, starts {, parse fails): error shown, Format disabled, aria-invalid true", () => {
    render(<JsonTextarea name="body" label="Body" />);

    fireEvent.change(screen.getByLabelText("Body"), {
      target: { value: '{"bad"' },
    });

    expect(screen.getByText("Invalid JSON")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Format JSON" })).toBeDisabled();
    expect(screen.getByLabelText("Body")).toHaveAttribute("aria-invalid", "true");
  });

  it("valid JSON: no error, Format enabled, aria-invalid not true", () => {
    render(<JsonTextarea name="body" label="Body" />);

    fireEvent.change(screen.getByLabelText("Body"), {
      target: { value: '{"a":1}' },
    });

    expect(screen.queryByText("Invalid JSON")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Format JSON" })).not.toBeDisabled();
    expect(screen.getByLabelText("Body")).not.toHaveAttribute("aria-invalid", "true");
  });

  it("Format button click prettifies valid compact JSON", () => {
    render(<JsonTextarea name="body" label="Body" />);
    const input = '{"a":1,"b":2}';

    fireEvent.change(screen.getByLabelText("Body"), {
      target: { value: input },
    });
    fireEvent.click(screen.getByRole("button", { name: "Format JSON" }));

    expect(screen.getByLabelText("Body")).toHaveValue(
      JSON.stringify(JSON.parse(input), null, 2),
    );
  });

  it("defaultValue pre-fills textarea", () => {
    render(<JsonTextarea name="body" label="Body" defaultValue='{"x":1}' />);

    expect(screen.getByLabelText("Body")).toHaveValue('{\n  "x": 1\n}');
  });

  it("auto-formats valid compact JSON in defaultValue on mount", () => {
    render(
      <JsonTextarea name="body" label="Body" defaultValue='{"x":1,"y":2}' />,
    );

    expect(screen.getByLabelText("Body")).toHaveValue(
      '{\n  "x": 1,\n  "y": 2\n}',
    );
  });

  it("leaves invalid defaultValue untouched (no crash)", () => {
    render(
      <JsonTextarea name="body" label="Body" defaultValue="{not valid" />,
    );

    expect(screen.getByLabelText("Body")).toHaveValue("{not valid");
  });

  it("leaves empty defaultValue untouched (no crash)", () => {
    render(<JsonTextarea name="body" label="Body" defaultValue="" />);

    expect(screen.getByLabelText("Body")).toHaveValue("");
  });

  it("leaves bare primitive defaultValue untouched", () => {
    render(<JsonTextarea name="body" label="Body" defaultValue='"42"' />);

    expect(screen.getByLabelText("Body")).toHaveValue('"42"');
  });

  it("defaultValue validity reflects that value (valid JSON → Format enabled)", () => {
    render(<JsonTextarea name="body" label="Body" defaultValue='{"x":1}' />);

    expect(screen.getByRole("button", { name: "Format JSON" })).not.toBeDisabled();
    expect(screen.queryByText("Invalid JSON")).not.toBeInTheDocument();
  });

  it("name prop forwarded to underlying textarea element", () => {
    render(<JsonTextarea name="itemJson" label="Body" />);

    expect(screen.getByLabelText("Body")).toHaveAttribute("name", "itemJson");
  });

  it("plain text body (no { or [ prefix): no error shown", () => {
    render(<JsonTextarea name="body" label="Body" />);

    fireEvent.change(screen.getByLabelText("Body"), {
      target: { value: "hello world" },
    });

    expect(screen.queryByText("Invalid JSON")).not.toBeInTheDocument();
    expect(screen.getByLabelText("Body")).not.toHaveAttribute("aria-invalid", "true");
  });

  it("Format button has type=button to avoid form submission", () => {
    render(<JsonTextarea name="body" label="Body" />);

    expect(screen.getByRole("button", { name: "Format JSON" })).toHaveAttribute(
      "type",
      "button",
    );
  });
});
