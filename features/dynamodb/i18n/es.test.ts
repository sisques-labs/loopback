import { describe, expect, it } from "vitest";
import en from "./en";
import es from "./es";

describe("DynamoDB Spanish copy", () => {
  it("ends create-table success with a terminal period", () => {
    expect(es.createTableDialog.successToast.endsWith(".")).toBe(true);
  });

  it("provides localized partition and sort key placeholders", () => {
    expect(es.createTableDialog.pkNamePlaceholder).toBe("pk");
    expect(es.createTableDialog.skNamePlaceholder).toBe("sk");
  });

  describe("seedDialog i18n parity", () => {
    it("every key in en.seedDialog exists in es.seedDialog", () => {
      const enKeys = Object.keys(en.seedDialog) as (keyof typeof en.seedDialog)[];
      for (const key of enKeys) {
        expect(
          es.seedDialog,
          `es.seedDialog is missing key: "${key}"`,
        ).toHaveProperty(key);
      }
    });
  });
});
