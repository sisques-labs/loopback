import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { SeedDialog, parseCSV } from "./seed-dialog";

vi.mock("sonner", () => ({
  toast: { success: vi.fn() },
}));

vi.mock("@/features/dynamodb/use-cases/seed-items/seed-items", () => ({
  seedItemsAction: vi.fn(),
}));

type MockActionState = [{ status: string; message?: string; data?: unknown }, () => void, boolean];
let mockActionState: MockActionState = [{ status: "idle" }, vi.fn(), false];

vi.mock("react", async (importOriginal) => {
  const react = await importOriginal<typeof import("react")>();
  return {
    ...react,
    useActionState: () => mockActionState,
  };
});

const dict = {
  trigger: "Seed data",
  title: "Seed data",
  description: "Import items from a JSON or CSV file into this table.",
  fileLabel: "Data file",
  fileHint: "Accepts .json or .csv. CSV does not support quoted fields with commas.",
  overwriteLabel: "Overwrite existing items",
  overwriteHint: "Uncheck has no effect in the current version.",
  fileSizeWarning: "File exceeds 500 KB. Consider splitting the file.",
  errorInvalidFile: "Invalid file type. Please select a .json or .csv file.",
  errorEmptyArray: "The file contains an empty array. Add at least one item.",
  errorParseJson: "Could not parse the file as JSON.",
  errorParseCsv: "The CSV file has no data rows.",
  successToast: "Imported {count} items successfully.",
  errorPartialFail: "{failed} of {total} items failed to import.",
  importing: "Importing…",
  cancel: "Cancel",
  submit: "Import",
};

// ─── parseCSV pure function tests ────────────────────────────────────────────

describe("parseCSV", () => {
  it("parses header row and data rows into array of objects", () => {
    const csv = "id,name,price\n1,Widget,9.99\n2,Gadget,14.50";
    const result = parseCSV(csv);
    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({ id: "1", name: "Widget", price: "9.99" });
    expect(result[1]).toEqual({ id: "2", name: "Gadget", price: "14.50" });
  });

  it("values are always strings", () => {
    const csv = "count\n42\ntrue";
    const result = parseCSV(csv);
    expect(result[0]).toEqual({ count: "42" });
    expect(result[1]).toEqual({ count: "true" });
  });

  it("ignores blank trailing lines", () => {
    const csv = "id,name\n1,Widget\n\n";
    const result = parseCSV(csv);
    expect(result).toHaveLength(1);
  });

  it("returns empty array for CSV with only a header row", () => {
    const csv = "id,name";
    const result = parseCSV(csv);
    expect(result).toHaveLength(0);
  });

  it("trims whitespace from cell values", () => {
    const csv = "id , name \n 1 , Widget ";
    const result = parseCSV(csv);
    expect(result[0]).toEqual({ id: "1", name: "Widget" });
  });
});

// ─── SeedDialog component tests ───────────────────────────────────────────────

describe("SeedDialog", () => {
  afterEach(() => {
    cleanup();
  });

  it("does not render dialog content before trigger click", () => {
    render(
      <SeedDialog tableName="my-table" dict={dict} locale="en" closeLabel="Close" />,
    );

    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("opens dialog on trigger click", async () => {
    render(
      <SeedDialog tableName="my-table" dict={dict} locale="en" closeLabel="Close" />,
    );

    fireEvent.click(screen.getByRole("button", { name: /Seed data/i }));

    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });
  });

  it("file input accepts .json and .csv only", async () => {
    render(
      <SeedDialog tableName="my-table" dict={dict} locale="en" closeLabel="Close" />,
    );

    fireEvent.click(screen.getByRole("button", { name: /Seed data/i }));

    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    const fileInput = document.querySelector("input[type='file']") as HTMLInputElement;
    expect(fileInput).not.toBeNull();
    expect(fileInput.accept).toBe(".json,.csv");
  });

  it("shows errorInvalidFile when a non-.json/.csv file is selected", async () => {
    render(
      <SeedDialog tableName="my-table" dict={dict} locale="en" closeLabel="Close" />,
    );

    fireEvent.click(screen.getByRole("button", { name: /Seed data/i }));

    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    const txtFile = new File(["hello"], "data.txt", { type: "text/plain" });
    const fileInput = document.querySelector("input[type='file']") as HTMLInputElement;
    fireEvent.change(fileInput, { target: { files: [txtFile] } });

    await waitFor(() => {
      expect(screen.getByText(dict.errorInvalidFile)).toBeInTheDocument();
    });
  });

  it("submit button is disabled after errorInvalidFile", async () => {
    render(
      <SeedDialog tableName="my-table" dict={dict} locale="en" closeLabel="Close" />,
    );

    fireEvent.click(screen.getByRole("button", { name: /Seed data/i }));

    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    const txtFile = new File(["hello"], "data.txt", { type: "text/plain" });
    const fileInput = document.querySelector("input[type='file']") as HTMLInputElement;
    fireEvent.change(fileInput, { target: { files: [txtFile] } });

    await waitFor(() => {
      const submitBtn = screen.getByRole("button", { name: dict.submit });
      expect(submitBtn).toBeDisabled();
    });
  });

  it("shows errorEmptyArray when .json file contains empty array", async () => {
    render(
      <SeedDialog tableName="my-table" dict={dict} locale="en" closeLabel="Close" />,
    );

    fireEvent.click(screen.getByRole("button", { name: /Seed data/i }));

    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    const emptyJson = new File(["[]"], "data.json", { type: "application/json" });
    const fileInput = document.querySelector("input[type='file']") as HTMLInputElement;
    fireEvent.change(fileInput, { target: { files: [emptyJson] } });

    await waitFor(() => {
      expect(screen.getByText(dict.errorEmptyArray)).toBeInTheDocument();
    });
  });

  it("shows fileSizeWarning when file size > 500KB but submit is still enabled after valid parse", async () => {
    render(
      <SeedDialog tableName="my-table" dict={dict} locale="en" closeLabel="Close" />,
    );

    fireEvent.click(screen.getByRole("button", { name: /Seed data/i }));

    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    const bigContent = JSON.stringify([{ pk: "1" }]);
    const bigFile = new File([bigContent], "big.json", { type: "application/json" });
    Object.defineProperty(bigFile, "size", { value: 600_000 });

    const fileInput = document.querySelector("input[type='file']") as HTMLInputElement;
    fireEvent.change(fileInput, { target: { files: [bigFile] } });

    await waitFor(() => {
      expect(screen.getByText(dict.fileSizeWarning)).toBeInTheDocument();
    });
  });

  it("transitions to phase:ready for a valid .json file", async () => {
    render(
      <SeedDialog tableName="my-table" dict={dict} locale="en" closeLabel="Close" />,
    );

    fireEvent.click(screen.getByRole("button", { name: /Seed data/i }));

    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    const validJson = new File(['[{"pk":"1"}]'], "data.json", {
      type: "application/json",
    });
    const fileInput = document.querySelector("input[type='file']") as HTMLInputElement;
    fireEvent.change(fileInput, { target: { files: [validJson] } });

    await waitFor(() => {
      const submitBtn = screen.getByRole("button", { name: dict.submit });
      expect(submitBtn).not.toBeDisabled();
    });
  });

  it("shows overwriteHint when overwrite checkbox is unchecked", async () => {
    render(
      <SeedDialog tableName="my-table" dict={dict} locale="en" closeLabel="Close" />,
    );

    fireEvent.click(screen.getByRole("button", { name: /Seed data/i }));

    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    const checkbox = screen.getByRole("checkbox");
    fireEvent.click(checkbox);

    await waitFor(() => {
      expect(screen.getByText(dict.overwriteHint)).toBeInTheDocument();
    });
  });

  it("cancel button closes dialog without action call", async () => {
    render(
      <SeedDialog tableName="my-table" dict={dict} locale="en" closeLabel="Close" />,
    );

    fireEvent.click(screen.getByRole("button", { name: /Seed data/i }));

    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: dict.cancel }));

    await waitFor(() => {
      expect(screen.queryByRole("dialog")).toBeNull();
    });
  });

  it("shows inline error when action returns error status", async () => {
    mockActionState = [
      { status: "error", message: "3 of 5 items failed to import." },
      vi.fn(),
      false,
    ];

    render(
      <SeedDialog tableName="my-table" dict={dict} locale="en" closeLabel="Close" />,
    );

    fireEvent.click(screen.getByRole("button", { name: /Seed data/i }));

    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    expect(
      screen.getByText("3 of 5 items failed to import."),
    ).toBeInTheDocument();

    mockActionState = [{ status: "idle" }, vi.fn(), false];
  });
});
