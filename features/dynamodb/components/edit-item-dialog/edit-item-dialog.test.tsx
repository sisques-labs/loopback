import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { EditItemDialog } from "./edit-item-dialog";

vi.mock("sonner", () => ({
  toast: { success: vi.fn() },
}));

vi.mock("@/features/dynamodb/use-cases/update-item/update-item", () => ({
  updateItemAction: vi.fn(),
}));

vi.mock("react", async (importOriginal) => {
  const react = await importOriginal<typeof import("react")>();
  return {
    ...react,
    useActionState: () => [{ status: "idle" }, vi.fn(), false] as const,
  };
});

const dict = {
  trigger: "Edit",
  title: "Edit item",
  description: "Edit non-key attributes.",
  keyFieldsLabel: "Key fields (locked)",
  jsonLabel: "Item JSON",
  jsonHint: "Edit non-key attributes.",
  cancel: "Cancel",
  submit: "Save changes",
  saving: "Saving…",
  successToast: "Item updated.",
  overwriteWarning: "This will overwrite all non-key attributes.",
  invalidJson: "Invalid JSON",
  notObject: "Not an object",
};

const itemA = { pk: "item-1", name: "Test" };
const itemB = { pk: "item-2", name: "Other" };

function renderDialog(item = itemA) {
  return render(
    <EditItemDialog
      tableName="my-table"
      item={item}
      partitionKeyName="pk"
      dict={dict}
      locale="en"
      open
      onOpenChange={vi.fn()}
      closeLabel="Close"
    />,
  );
}

describe("EditItemDialog", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders overwrite warning with muted foreground token classes", () => {
    renderDialog();

    const warning = screen.getByText(dict.overwriteWarning);
    expect(warning.className).toContain("text-muted-foreground");
    expect(warning.className).not.toContain("amber");
  });

  it("renders the shared Textarea primitive for item JSON", () => {
    renderDialog();

    expect(screen.getByLabelText("Item JSON")).toHaveAttribute(
      "data-slot",
      "textarea",
    );
  });

  it("textarea is pre-filled with JSON.stringify(item, null, 2) on open", () => {
    renderDialog();

    expect(screen.getByLabelText("Item JSON")).toHaveValue(
      JSON.stringify(itemA, null, 2),
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

  it("remount with different key shows new item JSON (stale-value prevention)", () => {
    const { unmount } = renderDialog(itemA);
    unmount();

    renderDialog(itemB);

    expect(screen.getByLabelText("Item JSON")).toHaveValue(
      JSON.stringify(itemB, null, 2),
    );
  });
});
