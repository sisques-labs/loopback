import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, act, fireEvent, cleanup } from "@testing-library/react";

vi.mock("server-only", () => ({}));
vi.mock("next/link", () => ({
  default: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}));
vi.mock("@/features/sqs/use-cases/list-queues-action/list-queues-action", () => ({
  listQueuesAction: vi.fn(),
}));
vi.mock("@/features/sqs/components/queue-row-actions/queue-row-actions", () => ({
  QueueRowActions: () => null,
}));
vi.mock("@/features/sqs/lib/encode-queue-url-param", () => ({
  encodeQueueUrlForRoute: (url: string) => encodeURIComponent(url),
}));

import React from "react";
import { listQueuesAction } from "@/features/sqs/use-cases/list-queues-action/list-queues-action";
import { SQSListShell } from "./sqs-list-shell";
import type { QueueListItem } from "@/features/sqs/types/sqs";

// ── Test data ────────────────────────────────────────────────────────────────

const initialQueues: QueueListItem[] = [
  { queueUrl: "http://localhost:4566/000000000000/alpha-queue", name: "alpha-queue", isFifo: false },
  { queueUrl: "http://localhost:4566/000000000000/beta-queue", name: "beta-queue", isFifo: false },
];

const updatedQueues: QueueListItem[] = [
  { queueUrl: "http://localhost:4566/000000000000/alpha-queue", name: "alpha-queue", isFifo: false },
  { queueUrl: "http://localhost:4566/000000000000/beta-queue", name: "beta-queue", isFifo: false },
  { queueUrl: "http://localhost:4566/000000000000/gamma-queue", name: "gamma-queue", isFifo: false },
];

const dict = {
  queueTable: { name: "Name", url: "Queue URL", type: "Type", typeFifo: "FIFO", typeStandard: "Standard" },
  queueRowActions: {
    actions: "Queue actions",
    delete: "Delete",
    deleteTitle: "Delete queue",
    deleteConfirm: "Are you sure you want to delete {queue}?",
    viewDetail: "View detail",
  },
  confirmDialog: { cancel: "Cancel", confirm: "Confirm", confirming: "{confirmLabel}…" },
  page: {
    title: "SQS Queues",
    empty: "No queues found in this account.",
    filterPlaceholder: "Filter by name",
    filterEmpty: "No queues match your filter.",
  },
  dialog: { close: "Close" },
};

const localePrefix = "/en";
const locale = "en" as const;

// ── Helpers ──────────────────────────────────────────────────────────────────

async function advancePoll() {
  await act(async () => {
    vi.advanceTimersByTime(5000);
    await Promise.resolve();
    await Promise.resolve();
  });
}

// ── Setup ────────────────────────────────────────────────────────────────────

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.restoreAllMocks();
});

// ── Tests ────────────────────────────────────────────────────────────────────

describe("SQSListShell — SSR-first render", () => {
  it("renders initialItems immediately before the first poll fires", () => {
    vi.mocked(listQueuesAction).mockResolvedValue([]);

    render(
      <SQSListShell initialItems={initialQueues} dict={dict} localePrefix={localePrefix} locale={locale} />,
    );

    expect(screen.getByText("alpha-queue")).toBeInTheDocument();
    expect(screen.getByText("beta-queue")).toBeInTheDocument();
    expect(listQueuesAction).not.toHaveBeenCalled();
  });
});

describe("SQSListShell — polling updates the table", () => {
  it("updates the displayed list after a poll interval fires", async () => {
    vi.mocked(listQueuesAction).mockResolvedValue(updatedQueues);

    render(
      <SQSListShell initialItems={initialQueues} dict={dict} localePrefix={localePrefix} locale={locale} />,
    );

    await advancePoll();

    expect(screen.getByText("gamma-queue")).toBeInTheDocument();
  });
});

describe("SQSListShell — filter narrows rows case-insensitively", () => {
  it("shows only rows matching the filter text", async () => {
    vi.mocked(listQueuesAction).mockResolvedValue([]);

    render(
      <SQSListShell initialItems={initialQueues} dict={dict} localePrefix={localePrefix} locale={locale} />,
    );

    const input = screen.getByPlaceholderText("Filter by name");
    await act(async () => {
      fireEvent.change(input, { target: { value: "alpha" } });
    });

    expect(screen.getByText("alpha-queue")).toBeInTheDocument();
    expect(screen.queryByText("beta-queue")).not.toBeInTheDocument();
  });

  it("is case-insensitive", async () => {
    vi.mocked(listQueuesAction).mockResolvedValue([]);

    render(
      <SQSListShell initialItems={initialQueues} dict={dict} localePrefix={localePrefix} locale={locale} />,
    );

    const input = screen.getByPlaceholderText("Filter by name");
    await act(async () => {
      fireEvent.change(input, { target: { value: "BETA" } });
    });

    expect(screen.getByText("beta-queue")).toBeInTheDocument();
    expect(screen.queryByText("alpha-queue")).not.toBeInTheDocument();
  });

  it("shows all rows when the filter is cleared", async () => {
    vi.mocked(listQueuesAction).mockResolvedValue([]);

    render(
      <SQSListShell initialItems={initialQueues} dict={dict} localePrefix={localePrefix} locale={locale} />,
    );

    const input = screen.getByPlaceholderText("Filter by name");
    await act(async () => {
      fireEvent.change(input, { target: { value: "alpha" } });
    });
    await act(async () => {
      fireEvent.change(input, { target: { value: "" } });
    });

    expect(screen.getByText("alpha-queue")).toBeInTheDocument();
    expect(screen.getByText("beta-queue")).toBeInTheDocument();
  });
});

describe("SQSListShell — filter survives a poll", () => {
  it("applies the active filter over fresh poll results", async () => {
    vi.mocked(listQueuesAction).mockResolvedValue(updatedQueues);

    render(
      <SQSListShell initialItems={initialQueues} dict={dict} localePrefix={localePrefix} locale={locale} />,
    );

    // Set filter before poll fires
    const input = screen.getByPlaceholderText("Filter by name");
    await act(async () => {
      fireEvent.change(input, { target: { value: "beta" } });
    });

    // Trigger poll
    await advancePoll();

    // After poll, filter is still applied — gamma-queue is not shown
    expect(screen.getByText("beta-queue")).toBeInTheDocument();
    expect(screen.queryByText("alpha-queue")).not.toBeInTheDocument();
    expect(screen.queryByText("gamma-queue")).not.toBeInTheDocument();
  });
});

describe("SQSListShell — empty initial state still polls", () => {
  it("mounts with empty initialItems and polls when interval fires", async () => {
    vi.mocked(listQueuesAction).mockResolvedValue(initialQueues);

    render(
      <SQSListShell initialItems={[]} dict={dict} localePrefix={localePrefix} locale={locale} />,
    );

    // No queue rows shown initially
    expect(screen.queryByText("alpha-queue")).not.toBeInTheDocument();

    // Trigger poll
    await advancePoll();

    expect(screen.getByText("alpha-queue")).toBeInTheDocument();
  });
});
