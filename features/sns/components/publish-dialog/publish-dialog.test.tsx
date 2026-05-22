import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { PublishDialog } from "./publish-dialog";

vi.mock("sonner", () => ({
  toast: { success: vi.fn() },
}));

vi.mock("@/features/sns/use-cases/publish-message/publish-message", () => ({
  publishMessageAction: vi.fn(),
}));

vi.mock("react", async (importOriginal) => {
  const react = await importOriginal<typeof import("react")>();
  return {
    ...react,
    useActionState: () => [{ status: "idle" }, vi.fn(), false] as const,
  };
});

const dict = {
  trigger: "Publish",
  title: "Publish message to {topic}",
  messageLabel: "Message",
  messagePlaceholder: "Message body…",
  subjectLabel: "Subject (optional)",
  cancel: "Cancel",
  submit: "Publish",
  submitting: "Publishing…",
  successToast: "Message published to {topic}.",
  invalidJson: "Message must be valid JSON.",
  tooLarge: "Message exceeds 256 KB limit.",
};

describe("PublishDialog", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders the shared Textarea primitive for the message body", () => {
    render(
      <PublishDialog
        topicArn="arn:aws:sns:us-east-1:000000000000:my-topic"
        topicName="my-topic"
        dict={dict}
        locale="en"
        closeLabel="Close"
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /Publish/i }));

    expect(screen.getByLabelText("Message")).toHaveAttribute(
      "data-slot",
      "textarea",
    );
  });

  it("submit button is disabled when invalid JSON is typed in the message field", () => {
    render(
      <PublishDialog
        topicArn="arn:aws:sns:us-east-1:000000000000:my-topic"
        topicName="my-topic"
        dict={dict}
        locale="en"
        closeLabel="Close"
      />,
    );

    // Open the dialog
    fireEvent.click(screen.getByRole("button", { name: /Publish/i }));

    const textarea = screen.getByLabelText("Message");
    // Type invalid JSON — starts with { so JsonTextarea will flag it
    fireEvent.change(textarea, { target: { value: "{broken json" } });

    const submitButton = screen.getByRole("button", { name: /^Publish$/i });
    expect(submitButton).toBeDisabled();
  });

  it("submit button is enabled when valid JSON is typed in the message field", () => {
    render(
      <PublishDialog
        topicArn="arn:aws:sns:us-east-1:000000000000:my-topic"
        topicName="my-topic"
        dict={dict}
        locale="en"
        closeLabel="Close"
      />,
    );

    // Open the dialog
    fireEvent.click(screen.getByRole("button", { name: /Publish/i }));

    const textarea = screen.getByLabelText("Message");
    // Type valid JSON
    fireEvent.change(textarea, { target: { value: '{"event":"test"}' } });

    const submitButton = screen.getByRole("button", { name: /^Publish$/i });
    expect(submitButton).not.toBeDisabled();
  });

  it("submit button is enabled for plain string messages (not JSON)", () => {
    render(
      <PublishDialog
        topicArn="arn:aws:sns:us-east-1:000000000000:my-topic"
        topicName="my-topic"
        dict={dict}
        locale="en"
        closeLabel="Close"
      />,
    );

    // Open the dialog
    fireEvent.click(screen.getByRole("button", { name: /Publish/i }));

    const textarea = screen.getByLabelText("Message");
    // Type a plain string message (not JSON)
    fireEvent.change(textarea, { target: { value: "Hello, world!" } });

    const submitButton = screen.getByRole("button", { name: /^Publish$/i });
    expect(submitButton).not.toBeDisabled();
  });
});
