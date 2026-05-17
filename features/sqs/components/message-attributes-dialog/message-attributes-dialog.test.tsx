import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MessageAttributesDialog } from "./message-attributes-dialog";

const dict = {
  trigger: "View attributes",
  title: "Message attributes",
  systemSection: "System attributes",
  customSection: "Message attributes",
  close: "Close",
};

const baseProps = {
  open: true,
  onClose: vi.fn(),
  attributes: undefined as Record<string, string> | undefined,
  messageAttributes: undefined as Record<string, { dataType: string; value: string }> | undefined,
  dict,
  closeLabel: dict.close,
};

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  cleanup();
});

describe("MessageAttributesDialog — system attributes rendered (REQ-03)", () => {
  it("renders system attribute key and value when attributes map is provided", () => {
    render(
      <MessageAttributesDialog
        {...baseProps}
        attributes={{ SentTimestamp: "1700000000000" }}
      />,
    );

    expect(screen.getByText("SentTimestamp")).toBeInTheDocument();
    expect(screen.getByText("1700000000000")).toBeInTheDocument();
  });
});

describe("MessageAttributesDialog — custom attributes rendered with dataType (REQ-03)", () => {
  it("renders custom attribute name, value and dataType inline", () => {
    render(
      <MessageAttributesDialog
        {...baseProps}
        messageAttributes={{ color: { dataType: "String", value: "red" } }}
      />,
    );

    expect(screen.getByText("color")).toBeInTheDocument();
    expect(screen.getByText("red")).toBeInTheDocument();
    expect(screen.getByText("(String)")).toBeInTheDocument();
  });
});

describe("MessageAttributesDialog — section hidden when data absent (REQ-03)", () => {
  it("does not render system section when attributes is undefined", () => {
    render(
      <MessageAttributesDialog
        {...baseProps}
        messageAttributes={{ color: { dataType: "String", value: "red" } }}
      />,
    );

    expect(screen.queryByText(dict.systemSection)).not.toBeInTheDocument();
  });

  it("does not render custom section when messageAttributes is undefined", () => {
    render(
      <MessageAttributesDialog
        {...baseProps}
        attributes={{ SentTimestamp: "1700000000000" }}
      />,
    );

    expect(screen.queryByRole("heading", { level: 3, name: dict.customSection })).not.toBeInTheDocument();
  });
});

describe("MessageAttributesDialog — hidden when open=false (REQ-03)", () => {
  it("does not render content when open is false", () => {
    render(
      <MessageAttributesDialog
        {...baseProps}
        open={false}
        attributes={{ SentTimestamp: "1700000000000" }}
      />,
    );

    expect(screen.queryByText(dict.title)).not.toBeInTheDocument();
    expect(screen.queryByText("SentTimestamp")).not.toBeInTheDocument();
  });
});

describe("MessageAttributesDialog — onClose called once (REQ-03)", () => {
  it("invokes onClose exactly once when close button is clicked", async () => {
    const onClose = vi.fn();
    render(
      <MessageAttributesDialog
        {...baseProps}
        onClose={onClose}
        attributes={{ SentTimestamp: "1700000000000" }}
      />,
    );

    const closeBtn = screen.getByText(dict.close, { selector: ".sr-only" });
    await act(async () => {
      closeBtn.closest("button")!.click();
    });

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});

describe("MessageAttributesDialog — no editable elements (REQ-06)", () => {
  it("contains no input, textarea, or form elements", () => {
    render(
      <MessageAttributesDialog
        {...baseProps}
        attributes={{ SentTimestamp: "1700000000000" }}
        messageAttributes={{ color: { dataType: "String", value: "red" } }}
      />,
    );

    expect(document.querySelector("input")).toBeNull();
    expect(document.querySelector("textarea")).toBeNull();
    expect(document.querySelector("form")).toBeNull();
  });
});
