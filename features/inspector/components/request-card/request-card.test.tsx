import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { RequestEntry } from "@/features/inspector/lib/types/types";
import type { InspectorDict } from "@/features/inspector/i18n/en";
import type { WidenStringLiterals } from "@/features/shared/i18n/widen-literals";

// ── Mocks ─────────────────────────────────────────────────────────────────────

vi.mock(
  "@/features/inspector/components/request-detail-dialog/request-detail-dialog",
  () => ({
    RequestDetailDialog: vi.fn(
      ({ open }: { open: boolean }) =>
        open ? <div data-testid="detail-dialog" /> : null,
    ),
  }),
);

import { RequestCard } from "./request-card";

// ── Fixtures ──────────────────────────────────────────────────────────────────

type CardDict = Pick<WidenStringLiterals<InspectorDict>, "card">;

const defaultDict: CardDict = {
  card: {
    duration: "{ms}ms",
    attempts: "{n} attempts",
    retries: "{n} retries",
  },
};

function makeEntry(overrides: Partial<RequestEntry> = {}): RequestEntry {
  return {
    id: "entry-1",
    timestamp: 1700000000000,
    service: "SQS",
    operation: "SendMessageCommand",
    input: { QueueUrl: "https://sqs.us-east-1.localhost.localstack.cloud/000000000000/test" },
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

describe("RequestCard", () => {
  it("renders the service name as a badge", () => {
    render(<RequestCard entry={makeEntry()} dict={defaultDict} />);
    expect(screen.getByText("SQS")).toBeInTheDocument();
  });

  it("renders the operation name", () => {
    render(<RequestCard entry={makeEntry()} dict={defaultDict} />);
    expect(screen.getByText("SendMessageCommand")).toBeInTheDocument();
  });

  it("renders the duration pill with ms value", () => {
    render(<RequestCard entry={makeEntry({ durationMs: 42 })} dict={defaultDict} />);
    expect(screen.getByText("42ms")).toBeInTheDocument();
  });

  it("renders a green status indicator for success", () => {
    render(<RequestCard entry={makeEntry({ status: "success" })} dict={defaultDict} />);
    const indicator = screen.getByTestId("status-indicator");
    expect(indicator).toBeInTheDocument();
    expect(indicator.getAttribute("data-status")).toBe("success");
  });

  it("renders a red status indicator for error", () => {
    render(<RequestCard entry={makeEntry({ status: "error", error: { name: "E", message: "fail" } })} dict={defaultDict} />);
    const indicator = screen.getByTestId("status-indicator");
    expect(indicator.getAttribute("data-status")).toBe("error");
  });

  it("does NOT render retry badge when attempts === 1", () => {
    render(<RequestCard entry={makeEntry({ attempts: 1 })} dict={defaultDict} />);
    expect(screen.queryByTestId("retry-badge")).not.toBeInTheDocument();
  });

  it("renders a retry badge when attempts > 1", () => {
    render(<RequestCard entry={makeEntry({ attempts: 3 })} dict={defaultDict} />);
    expect(screen.getByTestId("retry-badge")).toBeInTheDocument();
  });

  it("retry badge shows correct text for attempts > 1", () => {
    render(<RequestCard entry={makeEntry({ attempts: 3 })} dict={defaultDict} />);
    // attempts=3 means 2 retries (attempts - 1)
    expect(screen.getByTestId("retry-badge")).toHaveTextContent("2 retries");
  });

  it("retry badge shows '1 retries' when attempts === 2", () => {
    render(<RequestCard entry={makeEntry({ attempts: 2 })} dict={defaultDict} />);
    expect(screen.getByTestId("retry-badge")).toHaveTextContent("1 retries");
  });

  it("renders with a different service (DynamoDB)", () => {
    render(<RequestCard entry={makeEntry({ service: "DynamoDB" })} dict={defaultDict} />);
    expect(screen.getByText("DynamoDB")).toBeInTheDocument();
  });

  it("retry badge text comes from dict.card.retries template", () => {
    const customDict: CardDict = {
      card: {
        duration: "{ms}ms",
        attempts: "{n} attempts",
        retries: "{n} reintentos",
      },
    };
    render(<RequestCard entry={makeEntry({ attempts: 3 })} dict={customDict} />);
    // 3 attempts → 2 retries: should use the custom dict template
    expect(screen.getByTestId("retry-badge")).toHaveTextContent("2 reintentos");
  });
});
