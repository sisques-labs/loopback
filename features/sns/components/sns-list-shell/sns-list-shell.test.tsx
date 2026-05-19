import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, act, cleanup } from "@testing-library/react";

vi.mock("server-only", () => ({}));
vi.mock("next/link", () => ({
  default: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}));
vi.mock("@/features/sns/use-cases/list-topics-action/list-topics-action", () => ({
  listTopicsAction: vi.fn(),
}));
vi.mock("@/features/sns/components/topic-row-actions/topic-row-actions", () => ({
  TopicRowActions: () => null,
}));

import React from "react";
import { listTopicsAction } from "@/features/sns/use-cases/list-topics-action/list-topics-action";
import { SNSListShell } from "./sns-list-shell";
import type { Topic } from "@/features/sns/types/sns";

// ── Test data ────────────────────────────────────────────────────────────────

const initialTopics: Topic[] = [
  { arn: "arn:aws:sns:us-east-1:000000000000:alpha-topic", name: "alpha-topic", isFifo: false },
  { arn: "arn:aws:sns:us-east-1:000000000000:beta-topic", name: "beta-topic", isFifo: false },
];

const updatedTopics: Topic[] = [
  ...initialTopics,
  { arn: "arn:aws:sns:us-east-1:000000000000:gamma-topic", name: "gamma-topic", isFifo: false },
];

const dict = {
  topicTable: {
    name: "Name",
    displayName: "Display Name",
    arn: "ARN",
    type: "Type",
    typeFifo: "FIFO",
    typeStandard: "Standard",
  },
  topicRowActions: {
    actions: "Topic actions",
    delete: "Delete",
    deleteTitle: "Delete topic",
    deleteConfirm: "Are you sure you want to delete {topic}? This action cannot be undone.",
    viewDetail: "View detail",
    publish: "Publish message",
  },
  confirmDialog: { cancel: "Cancel", confirm: "Confirm", confirming: "{confirmLabel}…" },
  publishDialog: {
    trigger: "Publish",
    title: "Publish message to {topic}",
    messageLabel: "Message",
    messagePlaceholder: "Message body…",
    subjectLabel: "Subject (optional)",
    cancel: "Cancel",
    submit: "Publish",
    submitting: "Publishing…",
    successToast: "Message published to {topic}.",
  },
  page: {
    title: "SNS Topics",
    empty: "No topics found in this account.",
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

describe("SNSListShell — SSR-first render", () => {
  it("renders initialItems immediately before the first poll fires", () => {
    vi.mocked(listTopicsAction).mockResolvedValue([]);

    render(
      <SNSListShell
        initialItems={initialTopics}
        dict={dict}
        localePrefix={localePrefix}
        locale={locale}
      />,
    );

    expect(screen.getByText("alpha-topic")).toBeInTheDocument();
    expect(screen.getByText("beta-topic")).toBeInTheDocument();
    expect(listTopicsAction).not.toHaveBeenCalled();
  });
});

describe("SNSListShell — polling updates the table", () => {
  it("updates the displayed list after a poll interval fires", async () => {
    vi.mocked(listTopicsAction).mockResolvedValue(updatedTopics);

    render(
      <SNSListShell
        initialItems={initialTopics}
        dict={dict}
        localePrefix={localePrefix}
        locale={locale}
      />,
    );

    await advancePoll();

    expect(screen.getByText("gamma-topic")).toBeInTheDocument();
  });
});

describe("SNSListShell — no filter input", () => {
  it("does not render a filter input", () => {
    vi.mocked(listTopicsAction).mockResolvedValue([]);

    render(
      <SNSListShell
        initialItems={initialTopics}
        dict={dict}
        localePrefix={localePrefix}
        locale={locale}
      />,
    );

    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
  });
});

describe("SNSListShell — empty initial state still polls", () => {
  it("mounts with empty initialItems and polls when interval fires", async () => {
    vi.mocked(listTopicsAction).mockResolvedValue(initialTopics);

    render(
      <SNSListShell
        initialItems={[]}
        dict={dict}
        localePrefix={localePrefix}
        locale={locale}
      />,
    );

    expect(screen.queryByText("alpha-topic")).not.toBeInTheDocument();

    await advancePoll();

    expect(screen.getByText("alpha-topic")).toBeInTheDocument();
  });
});
