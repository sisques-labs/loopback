import { describe, expect, it } from "vitest";
import en from "./en";

describe("DynamoDB English copy", () => {
  it("ends create-table success with a terminal period", () => {
    expect(en.createTableDialog.successToast.endsWith(".")).toBe(true);
  });

  it("provides localized partition and sort key placeholders", () => {
    expect(en.createTableDialog.pkNamePlaceholder).toBe("pk");
    expect(en.createTableDialog.skNamePlaceholder).toBe("sk");
  });
});
