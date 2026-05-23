import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { RequestEntry } from "@/features/inspector/lib/types/types";
import type { InspectorDict } from "@/features/inspector/i18n/en";
import type { WidenStringLiterals } from "@/features/shared/i18n/widen-literals";

// ── Mocks ─────────────────────────────────────────────────────────────────────

vi.mock("@/components/ui/dialog", () => ({
  Dialog: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogTrigger: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogContent: ({ children }: { children: React.ReactNode; closeLabel: string }) => (
    <div data-testid="dialog-content">{children}</div>
  ),
  DialogHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogTitle: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogDescription: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

import { RequestDetailDialog } from "./request-detail-dialog";

// ── Fixtures ──────────────────────────────────────────────────────────────────

const dict: WidenStringLiterals<InspectorDict>["detail"] = {
  title: "Request Detail",
  input: "Input",
  output: "Output",
  attempts: "Attempts",
  duration: "Duration",
  timestamp: "Timestamp",
  error: "Error",
  closeLabel: "Close",
};

function makeEntry(overrides: Partial<RequestEntry> = {}): RequestEntry {
  return {
    id: "entry-1",
    timestamp: 1700000000000,
    service: "SQS",
    operation: "SendMessageCommand",
    input: { QueueUrl: "https://sqs.example.com" },
    output: { MessageId: "msg-1" },
    durationMs: 42,
    status: "success",
    attempts: 1,
    ...overrides,
  };
}

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("RequestDetailDialog", () => {
  it("renders the service and operation in the header", () => {
    render(<RequestDetailDialog open entry={makeEntry()} dict={dict} onClose={() => {}} />);
    expect(screen.getByText("SQS")).toBeInTheDocument();
    expect(screen.getByText("SendMessageCommand")).toBeInTheDocument();
  });

  it("renders input as JSON in a pre block", () => {
    const { container } = render(<RequestDetailDialog open entry={makeEntry()} dict={dict} onClose={() => {}} />);
    // Input label is shown
    expect(screen.getByText("Input")).toBeInTheDocument();
    // A <pre> element exists with the JSON content
    const pre = container.querySelector("pre");
    expect(pre).not.toBeNull();
    expect(pre!.textContent).toContain("QueueUrl");
  });

  it("renders output as JSON when available", () => {
    render(<RequestDetailDialog open entry={makeEntry({ output: { MessageId: "msg-1" } })} dict={dict} onClose={() => {}} />);
    expect(screen.getByText("Output")).toBeInTheDocument();
  });

  it("renders attempts count", () => {
    render(<RequestDetailDialog open entry={makeEntry({ attempts: 2 })} dict={dict} onClose={() => {}} />);
    expect(screen.getByText("Attempts")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
  });

  it("renders duration label", () => {
    render(<RequestDetailDialog open entry={makeEntry({ durationMs: 99 })} dict={dict} onClose={() => {}} />);
    expect(screen.getByText("Duration")).toBeInTheDocument();
    expect(screen.getByText("99ms")).toBeInTheDocument();
  });

  it("shows error section when status is error", () => {
    render(
      <RequestDetailDialog
        open
        entry={makeEntry({
          status: "error",
          error: { name: "ResourceNotFoundException", message: "Table not found" },
        })}
        dict={dict}
        onClose={() => {}}
      />
    );
    expect(screen.getByText("Error")).toBeInTheDocument();
    expect(screen.getByText("Table not found")).toBeInTheDocument();
  });

  it("does NOT show error section for successful entries", () => {
    render(<RequestDetailDialog open entry={makeEntry({ status: "success" })} dict={dict} onClose={() => {}} />);
    // Error label shouldn't appear for success entries
    const errorLabels = screen.queryAllByText("Error");
    // None or zero error sections
    expect(errorLabels.length).toBe(0);
  });
});
