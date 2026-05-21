import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useInvokeHistoryStore } from "@/features/lambda/stores/use-invoke-history-store/use-invoke-history-store";
import { InvokeDialog } from "./invoke-dialog";

vi.mock("@/features/lambda/use-cases/invoke-function/invoke-function", () => ({
  invokeFunctionAction: vi.fn(),
}));

// Shared mock factory — lets tests override state per describe block
let mockActionState: [unknown, () => void, boolean] = [{ status: "idle" }, vi.fn(), false];

vi.mock("react", async (importOriginal) => {
  const react = await importOriginal<typeof import("react")>();
  return {
    ...react,
    useActionState: () => mockActionState,
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
    mockActionState = [{ status: "idle" }, vi.fn(), false];
    useInvokeHistoryStore.setState({ entries: [] });
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

describe("InvokeDialog — history dispatch on success", () => {
  beforeEach(() => {
    useInvokeHistoryStore.setState({ entries: [] });
  });

  afterEach(() => {
    cleanup();
    mockActionState = [{ status: "idle" }, vi.fn(), false];
    useInvokeHistoryStore.setState({ entries: [] });
  });

  it("dispatches addEntry to the invoke history store when action settles with success", async () => {
    mockActionState = [
      { status: "success", data: { statusCode: 200, body: '{"ok":true}' } },
      vi.fn(),
      false,
    ];

    render(
      <InvokeDialog
        functionName="fn-a"
        dict={dict}
        locale="en"
        closeLabel="Close"
        payload="test-payload"
      />,
    );

    await waitFor(() => {
      const entries = useInvokeHistoryStore
        .getState()
        .entries.filter((e) => e.functionName === "fn-a");
      expect(entries).toHaveLength(1);
    });

    const entry = useInvokeHistoryStore
      .getState()
      .entries.find((e) => e.functionName === "fn-a");
    expect(entry).toBeDefined();
    expect(entry?.statusCode).toBe(200);
    expect(entry?.functionName).toBe("fn-a");
    expect(entry?.payloadHash).toHaveLength(8);
  });

  it("dispatches addEntry with functionError when invoke returns functionError", async () => {
    mockActionState = [
      {
        status: "success",
        data: { statusCode: 200, body: "", functionError: "Runtime.ExitError" },
      },
      vi.fn(),
      false,
    ];

    render(
      <InvokeDialog
        functionName="fn-b"
        dict={dict}
        locale="en"
        closeLabel="Close"
        payload="{}"
      />,
    );

    await waitFor(() => {
      const entries = useInvokeHistoryStore
        .getState()
        .entries.filter((e) => e.functionName === "fn-b");
      expect(entries).toHaveLength(1);
    });

    const entry = useInvokeHistoryStore
      .getState()
      .entries.find((e) => e.functionName === "fn-b");
    expect(entry?.functionError).toBe("Runtime.ExitError");
  });
});
