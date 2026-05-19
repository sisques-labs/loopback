import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, act, fireEvent, cleanup } from "@testing-library/react";

vi.mock("server-only", () => ({}));
vi.mock("next/link", () => ({
  default: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}));
vi.mock("@/features/s3/use-cases/list-buckets-action/list-buckets-action", () => ({
  listBucketsAction: vi.fn(),
}));
vi.mock("@/features/s3/components/bucket-row-actions/bucket-row-actions", () => ({
  BucketRowActions: () => null,
}));

import React from "react";
import { listBucketsAction } from "@/features/s3/use-cases/list-buckets-action/list-buckets-action";
import { S3ListShell } from "./s3-list-shell";
import type { Bucket } from "@/features/s3/types/s3";

// ── Test data ────────────────────────────────────────────────────────────────

const initialBuckets: Bucket[] = [
  { name: "alpha-bucket", createdAt: "2024-01-01T00:00:00.000Z" },
  { name: "beta-bucket", createdAt: "2024-02-01T00:00:00.000Z" },
];

const updatedBuckets: Bucket[] = [
  { name: "alpha-bucket", createdAt: "2024-01-01T00:00:00.000Z" },
  { name: "beta-bucket", createdAt: "2024-02-01T00:00:00.000Z" },
  { name: "gamma-bucket", createdAt: "2024-03-01T00:00:00.000Z" },
];

const dict = {
  bucketTable: { name: "Name", created: "Created" },
  bucketRowActions: {
    actions: "Bucket actions",
    delete: "Delete",
    deleteTitle: "Delete bucket",
    deleteConfirm: "Are you sure you want to delete {bucket}?",
  },
  confirmDialog: { cancel: "Cancel", confirm: "Confirm", confirming: "{confirmLabel}…" },
  page: {
    title: "S3 Buckets",
    empty: "No buckets found in this account.",
    filterPlaceholder: "Filter by name",
    filterEmpty: "No buckets match your filter.",
  },
  dialog: { close: "Close" },
};

const localePrefix = "/en";

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

describe("S3ListShell — SSR-first render", () => {
  it("renders initialItems immediately before the first poll fires", () => {
    vi.mocked(listBucketsAction).mockResolvedValue([]);

    render(
      <S3ListShell initialItems={initialBuckets} dict={dict} localePrefix={localePrefix} />,
    );

    expect(screen.getByText("alpha-bucket")).toBeInTheDocument();
    expect(screen.getByText("beta-bucket")).toBeInTheDocument();
    expect(listBucketsAction).not.toHaveBeenCalled();
  });
});

describe("S3ListShell — polling updates the table", () => {
  it("updates the displayed list after a poll interval fires", async () => {
    vi.mocked(listBucketsAction).mockResolvedValue(updatedBuckets);

    render(
      <S3ListShell initialItems={initialBuckets} dict={dict} localePrefix={localePrefix} />,
    );

    await advancePoll();

    expect(screen.getByText("gamma-bucket")).toBeInTheDocument();
  });
});

describe("S3ListShell — filter narrows rows case-insensitively", () => {
  it("shows only rows matching the filter text", async () => {
    vi.mocked(listBucketsAction).mockResolvedValue([]);

    render(
      <S3ListShell initialItems={initialBuckets} dict={dict} localePrefix={localePrefix} />,
    );

    const input = screen.getByPlaceholderText("Filter by name");
    await act(async () => {
      fireEvent.change(input, { target: { value: "alpha" } });
    });

    expect(screen.getByText("alpha-bucket")).toBeInTheDocument();
    expect(screen.queryByText("beta-bucket")).not.toBeInTheDocument();
  });

  it("is case-insensitive", async () => {
    vi.mocked(listBucketsAction).mockResolvedValue([]);

    render(
      <S3ListShell initialItems={initialBuckets} dict={dict} localePrefix={localePrefix} />,
    );

    const input = screen.getByPlaceholderText("Filter by name");
    await act(async () => {
      fireEvent.change(input, { target: { value: "BETA" } });
    });

    expect(screen.getByText("beta-bucket")).toBeInTheDocument();
    expect(screen.queryByText("alpha-bucket")).not.toBeInTheDocument();
  });

  it("shows all rows when the filter is cleared", async () => {
    vi.mocked(listBucketsAction).mockResolvedValue([]);

    render(
      <S3ListShell initialItems={initialBuckets} dict={dict} localePrefix={localePrefix} />,
    );

    const input = screen.getByPlaceholderText("Filter by name");
    await act(async () => {
      fireEvent.change(input, { target: { value: "alpha" } });
    });
    await act(async () => {
      fireEvent.change(input, { target: { value: "" } });
    });

    expect(screen.getByText("alpha-bucket")).toBeInTheDocument();
    expect(screen.getByText("beta-bucket")).toBeInTheDocument();
  });
});

describe("S3ListShell — filter survives a poll", () => {
  it("applies the active filter over fresh poll results", async () => {
    vi.mocked(listBucketsAction).mockResolvedValue(updatedBuckets);

    render(
      <S3ListShell initialItems={initialBuckets} dict={dict} localePrefix={localePrefix} />,
    );

    // Set filter before poll fires
    const input = screen.getByPlaceholderText("Filter by name");
    await act(async () => {
      fireEvent.change(input, { target: { value: "beta" } });
    });

    // Trigger poll
    await advancePoll();

    // After poll, filter is still applied — gamma-bucket is not shown
    expect(screen.getByText("beta-bucket")).toBeInTheDocument();
    expect(screen.queryByText("alpha-bucket")).not.toBeInTheDocument();
    expect(screen.queryByText("gamma-bucket")).not.toBeInTheDocument();
  });
});

describe("S3ListShell — empty initial state still polls", () => {
  it("mounts with empty initialItems and polls when interval fires", async () => {
    vi.mocked(listBucketsAction).mockResolvedValue(initialBuckets);

    render(
      <S3ListShell initialItems={[]} dict={dict} localePrefix={localePrefix} />,
    );

    // No bucket rows shown initially
    expect(screen.queryByText("alpha-bucket")).not.toBeInTheDocument();

    // Trigger poll
    await advancePoll();

    expect(screen.getByText("alpha-bucket")).toBeInTheDocument();
  });
});
