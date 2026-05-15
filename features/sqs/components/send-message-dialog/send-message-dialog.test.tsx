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
};

describe("SendMessageDialog", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders the shared Textarea primitive for the message body", () => {
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

    expect(screen.getByLabelText("Message body")).toHaveAttribute(
      "data-slot",
      "textarea",
    );
  });
});
