import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { SubscribeDialog } from "./subscribe-dialog";

vi.mock("@/features/sns/use-cases/subscribe/subscribe", () => ({
  subscribeAction: vi.fn(),
}));

vi.mock("react", async (importOriginal) => {
  const react = await importOriginal<typeof import("react")>();
  return {
    ...react,
    useActionState: () => [{ status: "idle" }, vi.fn(), false] as const,
  };
});

const dict = {
  trigger: "Subscribe",
  title: "Subscribe endpoint",
  protocolLabel: "Protocol",
  endpointLabel: "Endpoint",
  endpointPlaceholder: "e.g. https://example.com/webhook",
  cancel: "Cancel",
  submit: "Subscribe",
  submitting: "Subscribing…",
  fifoHint: "FIFO topics only support SQS subscriptions.",
};

describe("SubscribeDialog", () => {
  afterEach(() => {
    cleanup();
  });

  it("uses a 44px mobile touch target on the trigger button", () => {
    render(
      <SubscribeDialog
        topicArn="arn:aws:sns:us-east-1:000000000000:my-topic"
        isFifo={false}
        dict={dict}
        locale="en"
        closeLabel="Close"
      />,
    );

    const trigger = screen.getByRole("button", { name: /Subscribe/i });
    expect(trigger.className).toContain("min-h-11");
    expect(trigger.className).toContain("min-w-11");
  });
});
