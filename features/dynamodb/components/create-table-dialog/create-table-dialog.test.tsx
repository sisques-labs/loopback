import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { CreateTableDialog } from "./create-table-dialog";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock("sonner", () => ({
  toast: { success: vi.fn() },
}));

vi.mock("@/features/dynamodb/use-cases/create-table/create-table", () => ({
  createTableAction: vi.fn(),
}));

vi.mock("react", async (importOriginal) => {
  const react = await importOriginal<typeof import("react")>();
  return {
    ...react,
    useActionState: () => [{ status: "idle" }, vi.fn(), false] as const,
  };
});

const dict = {
  trigger: "Create table",
  title: "Create DynamoDB table",
  description: "Create a new DynamoDB table in LocalStack.",
  nameLabel: "Table name",
  namePlaceholder: "my-table",
  nameHint: "3–255 chars",
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
};

describe("CreateTableDialog", () => {
  afterEach(() => {
    cleanup();
  });

  it("uses a 44px mobile touch target on the trigger button", () => {
    render(
      <CreateTableDialog dict={dict} locale="en" closeLabel="Close" />,
    );

    const trigger = screen.getByRole("button", { name: /Create table/i });
    expect(trigger.className).toContain("min-h-11");
    expect(trigger.className).toContain("min-w-11");
  });
});
