import { cleanup, fireEvent, render, screen, act } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ObjectRowActions } from "./object-row-actions";

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

vi.mock("@/features/s3/use-cases/delete-object/delete-object", () => ({
  deleteObjectAction: vi.fn(),
}));

vi.mock(
  "@/features/s3/components/rename-object-dialog/rename-object-dialog",
  () => ({
    RenameObjectDialog: ({ open }: { open: boolean }) =>
      open ? <div data-testid="rename-dialog" /> : null,
  }),
);

vi.mock(
  "@/features/shared/components/confirm-dialog/confirm-dialog",
  () => ({
    ConfirmDialog: ({ open }: { open: boolean }) =>
      open ? <div data-testid="confirm-dialog" /> : null,
  }),
);

vi.mock(
  "@/features/s3/components/object-preview-dialog/object-preview-dialog",
  () => ({
    ObjectPreviewDialog: ({
      open,
      dict,
    }: {
      open: boolean;
      dict: { title: string };
    }) => (open ? <div data-testid="preview-dialog">{dict.title}</div> : null),
  }),
);

const dict = {
  actions: "Object actions",
  preview: "Preview",
  download: "Download",
  rename: "Rename",
  delete: "Delete",
  deleteTitle: "Delete object",
  deleteConfirm: "Are you sure you want to delete {key}?",
};

const renameDict = {
  title: "Rename object",
  keyLabel: "New key",
  submit: "Rename",
  cancel: "Cancel",
  renaming: "Renaming…",
  success: "Object renamed successfully.",
  failed: "Failed to rename object",
  sameKey: "New key must be different",
  emptyKey: "Key cannot be empty",
  leadingSlash: "Key must not start with a slash",
  tooLong: "Key must not exceed 1024 characters",
};

const confirmDict = {
  cancel: "Cancel",
  confirming: "Deleting…",
};

const previewDict = {
  title: "Preview",
  loading: "Loading preview…",
  unsupported: "This file type can't be previewed.",
  tooLarge: "File too large to preview (max 1 MB).",
  downloadInstead: "Download instead",
  error: "Couldn't load preview.",
};

const baseProps = {
  bucket: "my-bucket",
  objectKey: "photo.png",
  dict,
  renameDict,
  confirmDict,
  previewDict,
  closeLabel: "Close",
};

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  cleanup();
});

function openDropdown() {
  const trigger = screen.getByRole("button", { name: /Object actions/i });
  act(() => {
    fireEvent.click(trigger);
  });
}

describe("ObjectRowActions", () => {
  it("shows Preview menu item when dropdown is opened", () => {
    render(<ObjectRowActions {...baseProps} />);
    openDropdown();
    expect(screen.getByText("Preview")).toBeInTheDocument();
  });

  it("Preview item appears before Download in DOM order", () => {
    render(<ObjectRowActions {...baseProps} />);
    openDropdown();

    const items = screen.getAllByRole("menuitem");
    const previewIndex = items.findIndex((el) => el.textContent?.includes("Preview"));
    const downloadIndex = items.findIndex((el) => el.textContent?.includes("Download"));

    expect(previewIndex).toBeLessThan(downloadIndex);
  });

  it("clicking Preview opens the preview dialog", () => {
    render(<ObjectRowActions {...baseProps} />);
    openDropdown();

    act(() => {
      fireEvent.click(screen.getByText("Preview"));
    });

    expect(screen.getByTestId("preview-dialog")).toBeInTheDocument();
  });

  it("preview dialog receives previewDict", () => {
    render(<ObjectRowActions {...baseProps} />);
    openDropdown();

    act(() => {
      fireEvent.click(screen.getByText("Preview"));
    });

    // The mock renders dict.title inside the dialog
    expect(screen.getByTestId("preview-dialog").textContent).toBe("Preview");
  });

  it("still shows Download, Rename, Delete items (regression)", () => {
    render(<ObjectRowActions {...baseProps} />);
    openDropdown();

    expect(screen.getByText("Download")).toBeInTheDocument();
    expect(screen.getByText("Rename")).toBeInTheDocument();
    expect(screen.getByText("Delete")).toBeInTheDocument();
  });
});
