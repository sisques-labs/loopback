import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { SendMessageDialog } from "./send-message-dialog";

vi.mock("sonner", () => ({
  toast: { success: vi.fn() },
}));

vi.mock("@/features/sqs/use-cases/send-message/send-message", () => ({
  sendMessageAction: vi.fn(),
}));

vi.mock("react", async (importOriginal) => {
  const react = await importOriginal<typeof import("react")>();
  return {
    ...react,
    useActionState: () => [{ status: "idle" }, vi.fn(), false] as const,
  };
});

const dict = {
  trigger: "Send message",
  title: "Send message to {queue}",
  bodyLabel: "Message body",
  bodyPlaceholder: "Plain text or JSON…",
  cancel: "Cancel",
  submitting: "Sending…",
  submit: "Send",
  successToast: "Message sent to {queue}.",
  invalidJson: "Invalid JSON syntax.",
  formatButton: "Format JSON",
};

function renderDialog() {
  render(
    <SendMessageDialog
      queueUrl="https://localhost/000000000000/test"
      queueName="test"
      isFifo={false}
      dict={dict}
      locale="en"
      closeLabel="Close"
    />,
  );
  fireEvent.click(screen.getByRole("button", { name: /Send message/i }));
}

describe("SendMessageDialog", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders the shared Textarea primitive for the message body", () => {
    renderDialog();

    expect(screen.getByLabelText("Message body")).toHaveAttribute(
      "data-slot",
      "textarea",
    );
  });

  it("shows invalidJson error, disables submit and sets aria-invalid when body is invalid JSON", () => {
    renderDialog();

    const textarea = screen.getByLabelText("Message body");
    fireEvent.change(textarea, { target: { value: '{"bad"' } });

    expect(screen.getByText(dict.invalidJson)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: dict.submit })).toBeDisabled();
    expect(textarea).toHaveAttribute("aria-invalid", "true");
  });

  it("shows no error and submit is enabled when body is plain text", () => {
    renderDialog();

    const textarea = screen.getByLabelText("Message body");
    fireEvent.change(textarea, { target: { value: "hello world" } });

    expect(screen.queryByText(dict.invalidJson)).not.toBeInTheDocument();
    expect(textarea).not.toHaveAttribute("aria-invalid", "true");
    expect(screen.getByRole("button", { name: dict.submit })).not.toBeDisabled();
  });

  it("disables Format button when body is empty", () => {
    renderDialog();

    expect(screen.getByRole("button", { name: dict.formatButton })).toBeDisabled();
  });

  it("disables Format button when body is invalid JSON", () => {
    renderDialog();

    fireEvent.change(screen.getByLabelText("Message body"), {
      target: { value: '{"bad"' },
    });

    expect(screen.getByRole("button", { name: dict.formatButton })).toBeDisabled();
  });

  it("prettifies valid compact JSON when Format button is clicked", () => {
    renderDialog();

    const textarea = screen.getByLabelText("Message body");
    const input = '{"a":1,"b":2}';
    fireEvent.change(textarea, { target: { value: input } });

    fireEvent.click(screen.getByRole("button", { name: dict.formatButton }));

    expect(textarea).toHaveValue(JSON.stringify(JSON.parse(input), null, 2));
  });

  it("Format button has type=button so it does not submit the form", () => {
    renderDialog();

    const formatBtn = screen.getByRole("button", { name: dict.formatButton });
    expect(formatBtn).toHaveAttribute("type", "button");
  });
});
