import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, act, cleanup } from "@testing-library/react";

vi.mock("server-only", () => ({}));
vi.mock("next/link", () => ({
  default: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}));
vi.mock("@/features/dynamodb/use-cases/list-tables-action/list-tables-action", () => ({
  listTablesAction: vi.fn(),
}));
vi.mock(
  "@/features/dynamodb/components/create-table-dialog/create-table-dialog",
  () => ({ CreateTableDialog: () => null }),
);
vi.mock(
  "@/features/dynamodb/components/delete-table-dialog/delete-table-dialog",
  () => ({ DeleteTableDialog: () => null }),
);

import React, { type ComponentProps } from "react";
import { listTablesAction } from "@/features/dynamodb/use-cases/list-tables-action/list-tables-action";
import { DynamoDBListShell } from "./dynamodb-list-shell";
import type { DynamoDBTable } from "@/features/dynamodb/types/dynamodb";

type ShellDict = ComponentProps<typeof DynamoDBListShell>["dict"];

// ── Test data ────────────────────────────────────────────────────────────────

const initialTables: DynamoDBTable[] = [
  {
    name: "alpha-table",
    status: "ACTIVE",
    itemCount: 10,
    tableSizeBytes: 1024,
    partitionKeyName: "pk",
    partitionKeyType: "S",
  },
  {
    name: "beta-table",
    status: "ACTIVE",
    itemCount: 0,
    tableSizeBytes: 0,
    partitionKeyName: "id",
    partitionKeyType: "N",
  },
];

const updatedTables: DynamoDBTable[] = [
  ...initialTables,
  {
    name: "gamma-table",
    status: "ACTIVE",
    itemCount: 5,
    tableSizeBytes: 512,
    partitionKeyName: "pk",
    partitionKeyType: "S",
  },
];

const dict = {
  page: {
    title: "DynamoDB",
    empty: "No tables found.",
    createCta: "Create table",
  },
  table: {
    name: "Name",
    status: "Status",
    itemCount: "Items",
    sizeBytes: "Size",
    partitionKey: "Partition Key",
    sortKey: "Sort Key",
    actions: "Actions",
    view: "View",
    delete: "Delete",
  },
  createTableDialog: {
    trigger: "Create table",
    title: "Create DynamoDB table",
    description: "Create a new DynamoDB table in LocalStack.",
    nameLabel: "Table name",
    namePlaceholder: "my-table",
    nameHint: "3–255 chars, letters, numbers, hyphens, underscores, dots",
    pkNameLabel: "Partition key name",
    pkNamePlaceholder: "pk",
    pkTypelabel: "Partition key type",
    addSortKey: "Add sort key",
    skNameLabel: "Sort key name (optional)",
    skNamePlaceholder: "sk",
    skTypeLabel: "Sort key type",
    cancel: "Cancel",
    submit: "Create",
    creating: "Creating…",
    successToast: "Table created successfully.",
  },
  createTableValidation: {
    nameRequired: "Table name is required.",
    nameInvalid: "Table name must be 3–255 characters.",
    pkNameRequired: "Partition key name is required.",
    pkTypeInvalid: "Please select a valid partition key type.",
    skIncomplete: "Sort key type is required when sort key name is provided.",
  },
  deleteTableDialog: {
    title: "Delete table",
    description: "This action cannot be undone. The table and all its data will be deleted.",
    confirm: "Delete",
    cancel: "Cancel",
    successToast: "Table deleted.",
  },
  confirmDialog: { cancel: "Cancel", confirm: "Confirm", confirming: "{confirmLabel}…" },
  dialog: { close: "Close" },
} as ShellDict;

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

describe("DynamoDBListShell — SSR-first render", () => {
  it("renders initialItems immediately before the first poll fires", () => {
    vi.mocked(listTablesAction).mockResolvedValue([]);

    render(
      <DynamoDBListShell
        initialItems={initialTables}
        dict={dict}
        localePrefix={localePrefix}
        locale={locale}
      />,
    );

    expect(screen.getByText("alpha-table")).toBeInTheDocument();
    expect(screen.getByText("beta-table")).toBeInTheDocument();
    expect(listTablesAction).not.toHaveBeenCalled();
  });
});

describe("DynamoDBListShell — polling updates the table", () => {
  it("updates the displayed list after a poll interval fires", async () => {
    vi.mocked(listTablesAction).mockResolvedValue(updatedTables);

    render(
      <DynamoDBListShell
        initialItems={initialTables}
        dict={dict}
        localePrefix={localePrefix}
        locale={locale}
      />,
    );

    await advancePoll();

    expect(screen.getByText("gamma-table")).toBeInTheDocument();
  });
});

describe("DynamoDBListShell — no filter input", () => {
  it("does not render a filter input", () => {
    vi.mocked(listTablesAction).mockResolvedValue([]);

    render(
      <DynamoDBListShell
        initialItems={initialTables}
        dict={dict}
        localePrefix={localePrefix}
        locale={locale}
      />,
    );

    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
  });
});

describe("DynamoDBListShell — empty initial state still polls", () => {
  it("mounts with empty initialItems and polls when interval fires", async () => {
    vi.mocked(listTablesAction).mockResolvedValue(initialTables);

    render(
      <DynamoDBListShell
        initialItems={[]}
        dict={dict}
        localePrefix={localePrefix}
        locale={locale}
      />,
    );

    expect(screen.queryByText("alpha-table")).not.toBeInTheDocument();

    await advancePoll();

    expect(screen.getByText("alpha-table")).toBeInTheDocument();
  });
});
