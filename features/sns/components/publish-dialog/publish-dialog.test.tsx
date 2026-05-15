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
});
