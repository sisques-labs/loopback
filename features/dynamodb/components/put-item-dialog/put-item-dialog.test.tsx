import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { PutItemDialog } from "./put-item-dialog";

vi.mock("sonner", () => ({
  toast: { success: vi.fn() },
}));

vi.mock("@/features/dynamodb/use-cases/put-item/put-item", () => ({
  putItemAction: vi.fn(),
}));

vi.mock("react", async (importOriginal) => {
  const react = await importOriginal<typeof import("react")>();
  return {
    ...react,
    useActionState: () => [{ status: "idle" }, vi.fn(), false] as const,
  };
});

const dict = {
  trigger: "Put item",
  title: "Put item",
  description: "Insert or replace an item.",
  jsonLabel: "Item JSON",
  jsonHint: "Write native JSON.",
  jsonPlaceholder: '{"pk": "value"}',
  cancel: "Cancel",
  submit: "Put item",
  saving: "Saving…",
  successToast: "Item saved.",
  invalidJson: "Invalid JSON",
  notObject: "Not an object",
};

function renderDialog() {
  render(
    <PutItemDialog
      tableName="my-table"
      partitionKeyName="pk"
      dict={dict}
      locale="en"
      closeLabel="Close"
    />,
  );
  fireEvent.click(screen.getByRole("button", { name: /Put item/i }));
}

describe("PutItemDialog", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders the shared Textarea primitive for item JSON", () => {
    renderDialog();

    expect(screen.getByLabelText("Item JSON")).toHaveAttribute(
      "data-slot",
      "textarea",
    );
  });

  it("renders the Format JSON button", () => {
    renderDialog();

    expect(screen.getByRole("button", { name: "Format JSON" })).toBeInTheDocument();
  });

  it("shows inline error and disables submit when invalid JSON is typed", () => {
    renderDialog();

    fireEvent.change(screen.getByLabelText("Item JSON"), {
      target: { value: '{"bad"' },
    });

    expect(screen.getByText("Invalid JSON")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: dict.submit })).toBeDisabled();
  });
});
