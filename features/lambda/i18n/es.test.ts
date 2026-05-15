import { describe, expect, it } from "vitest";
import es from "./es";

describe("Lambda Spanish copy", () => {
  it("ends create-function success with a terminal period", () => {
    expect(es.createFunctionDialog.successToast.endsWith(".")).toBe(true);
  });

  it("provides a localized invoke payload placeholder", () => {
    expect(es.invokeDialog.payloadPlaceholder).toContain("JSON");
  });
});
