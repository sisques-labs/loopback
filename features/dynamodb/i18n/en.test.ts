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

  describe("seedDialog i18n keys", () => {
    const EXPECTED_KEYS = [
      "trigger", "title", "description", "fileLabel", "fileHint",
      "overwriteLabel", "overwriteHint", "fileSizeWarning",
      "errorInvalidFile", "errorEmptyArray", "errorParseJson", "errorParseCsv",
      "successToast", "errorPartialFail", "importing", "cancel", "submit",
    ] as const;

    it("has all 17 required keys as non-empty strings", () => {
      for (const key of EXPECTED_KEYS) {
        expect(en.seedDialog[key], `seedDialog.${key}`).toBeTruthy();
      }
    });

    it("successToast contains {count} placeholder", () => {
      expect(en.seedDialog.successToast).toContain("{count}");
    });

    it("errorPartialFail contains {failed} and {total} placeholders", () => {
      expect(en.seedDialog.errorPartialFail).toContain("{failed}");
      expect(en.seedDialog.errorPartialFail).toContain("{total}");
    });
  });
});
