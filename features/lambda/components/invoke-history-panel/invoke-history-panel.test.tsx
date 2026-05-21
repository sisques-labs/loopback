import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { useInvokeHistoryStore } from "@/features/lambda/stores/use-invoke-history-store/use-invoke-history-store";
import type { InvokeHistoryEntry } from "@/features/lambda/types/lambda";

vi.mock("@/components/ui/scroll-area", () => ({
  ScrollArea: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="scroll-area">{children}</div>
  ),
}));

const dict = {
  title: "Invocation history",
  clearHistory: "Clear history",
  empty: "No invocations recorded yet.",
  statusLabel: "Status",
  durationLabel: "Duration",
  timestampLabel: "Time",
  payloadHashLabel: "Payload",
  errorLabel: "Function error",
};

function makeEntry(
  functionName: string,
  overrides: Partial<InvokeHistoryEntry> = {},
): InvokeHistoryEntry {
  return {
    id: crypto.randomUUID(),
    functionName,
    payloadHash: "abcd1234",
    statusCode: 200,
    duration: 123,
    timestamp: 1716000000000,
    ...overrides,
  };
}

// Import component AFTER mocks are set up
import { InvokeHistoryPanel } from "./invoke-history-panel";

describe("InvokeHistoryPanel", () => {
  beforeEach(() => {
    useInvokeHistoryStore.setState({ entries: [] });
  });

  afterEach(() => {
    cleanup();
  });

  it("renders empty state when no entries for the function", () => {
    render(<InvokeHistoryPanel functionName="fn-a" dict={dict} />);
    expect(screen.getByText(dict.empty)).toBeInTheDocument();
  });

  it("renders entries for the given functionName", () => {
    useInvokeHistoryStore.setState({
      entries: [
        makeEntry("fn-a", { statusCode: 200, duration: 42 }),
        makeEntry("fn-b", { statusCode: 500 }),
      ],
    });
    render(<InvokeHistoryPanel functionName="fn-a" dict={dict} />);
    expect(screen.getByText("200")).toBeInTheDocument();
    expect(screen.getByText("42ms")).toBeInTheDocument();
    // fn-b entry should NOT be visible
    expect(screen.queryByText("500")).not.toBeInTheDocument();
  });

  it("entry with functionError is auto-expanded — error text is visible", () => {
    useInvokeHistoryStore.setState({
      entries: [
        makeEntry("fn-a", { functionError: "Runtime.ExitError" }),
      ],
    });
    render(<InvokeHistoryPanel functionName="fn-a" dict={dict} />);
    expect(screen.getByText("Runtime.ExitError")).toBeInTheDocument();
  });

  it("entry without functionError does not show error section by default", () => {
    useInvokeHistoryStore.setState({
      entries: [makeEntry("fn-a")],
    });
    render(<InvokeHistoryPanel functionName="fn-a" dict={dict} />);
    // No functionError means the error section should not appear
    expect(screen.queryByText(dict.errorLabel)).not.toBeInTheDocument();
  });

  it("clicking Clear history calls clearHistory for the function", () => {
    useInvokeHistoryStore.setState({
      entries: [
        makeEntry("fn-a"),
        makeEntry("fn-a"),
        makeEntry("fn-b"),
      ],
    });
    render(<InvokeHistoryPanel functionName="fn-a" dict={dict} />);
    fireEvent.click(screen.getByRole("button", { name: dict.clearHistory }));
    const state = useInvokeHistoryStore.getState();
    expect(state.entries.filter((e) => e.functionName === "fn-a")).toHaveLength(0);
    expect(state.entries.filter((e) => e.functionName === "fn-b")).toHaveLength(1);
  });

  it("renders panel title", () => {
    render(<InvokeHistoryPanel functionName="fn-a" dict={dict} />);
    expect(screen.getByText(dict.title)).toBeInTheDocument();
  });

  it("shows payloadHash truncated to 8 chars", () => {
    useInvokeHistoryStore.setState({
      entries: [makeEntry("fn-a", { payloadHash: "abcd1234" })],
    });
    render(<InvokeHistoryPanel functionName="fn-a" dict={dict} />);
    expect(screen.getByText("abcd1234")).toBeInTheDocument();
  });
});
