import { cleanup, render, screen } from "@testing-library/react";
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

describe("EditItemDialog", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders overwrite warning with muted foreground token classes", () => {
    render(
      <EditItemDialog
        tableName="my-table"
        item={{ pk: "item-1", name: "Test" }}
        partitionKeyName="pk"
        dict={dict}
        locale="en"
        open
        onOpenChange={vi.fn()}
        closeLabel="Close"
      />,
    );

    const warning = screen.getByText(dict.overwriteWarning);
    expect(warning.className).toContain("text-muted-foreground");
    expect(warning.className).not.toContain("amber");
  });

  it("renders the shared Textarea primitive for item JSON", () => {
    render(
      <EditItemDialog
        tableName="my-table"
        item={{ pk: "item-1", name: "Test" }}
        partitionKeyName="pk"
        dict={dict}
        locale="en"
        open
        onOpenChange={vi.fn()}
        closeLabel="Close"
      />,
    );

    expect(screen.getByLabelText("Item JSON")).toHaveAttribute(
      "data-slot",
      "textarea",
    );
  });
});
