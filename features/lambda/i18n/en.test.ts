import { describe, expect, it } from "vitest";
import en from "./en";

describe("Lambda English copy", () => {
  it("ends create-function success with a terminal period", () => {
    expect(en.createFunctionDialog.successToast.endsWith(".")).toBe(true);
  });

  it("provides a localized invoke payload placeholder", () => {
    expect(en.invokeDialog.payloadPlaceholder).toContain("JSON");
  });
});
