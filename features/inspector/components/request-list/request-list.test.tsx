import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { RequestEntry } from "@/features/inspector/lib/types/types";

// ── Mocks ─────────────────────────────────────────────────────────────────────

vi.mock("@/features/inspector/components/request-card/request-card", () => ({
  RequestCard: ({ entry }: { entry: RequestEntry }) => (
    <div data-testid={`request-card-${entry.id}`}>{entry.service}</div>
  ),
}));

import { RequestList } from "./request-list";

// ── Fixtures ──────────────────────────────────────────────────────────────────

function makeEntry(id: string, service = "SQS"): RequestEntry {
  return {
    id,
    timestamp: 1700000000000,
    service,
    operation: "SendMessageCommand",
    input: {},
    output: {},
    durationMs: 10,
    status: "success",
    attempts: 1,
  };
}

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("RequestList", () => {
  it("renders one RequestCard per entry", () => {
    const entries = [makeEntry("e-1"), makeEntry("e-2"), makeEntry("e-3")];
    render(<RequestList entries={entries} />);
    expect(screen.getAllByTestId(/^request-card-/)).toHaveLength(3);
    expect(screen.getByTestId("request-card-e-1")).toBeInTheDocument();
    expect(screen.getByTestId("request-card-e-2")).toBeInTheDocument();
    expect(screen.getByTestId("request-card-e-3")).toBeInTheDocument();
  });

  it("renders zero cards for empty entries", () => {
    render(<RequestList entries={[]} />);
    expect(screen.queryAllByTestId(/^request-card-/)).toHaveLength(0);
  });

  it("renders cards with correct service names", () => {
    const entries = [makeEntry("e-1", "SQS"), makeEntry("e-2", "DynamoDB")];
    render(<RequestList entries={entries} />);
    expect(screen.getByText("SQS")).toBeInTheDocument();
    expect(screen.getByText("DynamoDB")).toBeInTheDocument();
  });
});
