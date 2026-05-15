import { describe, expect, it } from "vitest";
import es from "./es";

describe("DynamoDB Spanish copy", () => {
  it("ends create-table success with a terminal period", () => {
    expect(es.createTableDialog.successToast.endsWith(".")).toBe(true);
  });

  it("provides localized partition and sort key placeholders", () => {
    expect(es.createTableDialog.pkNamePlaceholder).toBe("pk");
    expect(es.createTableDialog.skNamePlaceholder).toBe("sk");
  });
});
