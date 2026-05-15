import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { InvokeDialog } from "./invoke-dialog";

vi.mock("@/features/lambda/use-cases/invoke-function/invoke-function", () => ({
  invokeFunctionAction: vi.fn(),
}));

vi.mock("react", async (importOriginal) => {
  const react = await importOriginal<typeof import("react")>();
  return {
    ...react,
    useActionState: () => [{ status: "idle" }, vi.fn(), false] as const,
  };
});

const dict = {
  title: "Invoke {functionName}",
  payloadLabel: "Payload (JSON)",
  payloadPlaceholder: "Leave empty or enter a valid JSON object…",
  cancel: "Cancel",
  submit: "Invoke",
  invoking: "Invoking…",
  responseTitle: "Response",
  statusCodeLabel: "Status code",
  bodyLabel: "Body",
  functionErrorTitle: "Function error",
  functionErrorDetail: "Error: {functionError}",
  invalidPayload: "Payload must be valid JSON.",
};

describe("InvokeDialog", () => {
  afterEach(() => {
    cleanup();
  });

  it("uses a 44px mobile touch target on the trigger button", () => {
    render(
      <InvokeDialog
        functionName="my-function"
        dict={dict}
        locale="en"
        closeLabel="Close"
      />,
    );

    const trigger = screen.getByRole("button", { name: /Invoke/i });
    expect(trigger.className).toContain("min-h-11");
    expect(trigger.className).toContain("min-w-11");
  });

  it("renders the shared Textarea primitive for the payload field", () => {
    render(
      <InvokeDialog
        functionName="my-function"
        dict={dict}
        locale="en"
        closeLabel="Close"
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /Invoke/i }));

    expect(screen.getByLabelText("Payload (JSON)")).toHaveAttribute(
      "data-slot",
      "textarea",
    );
  });
});
