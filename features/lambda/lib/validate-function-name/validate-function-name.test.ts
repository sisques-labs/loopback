import { describe, expect, it } from "vitest";
import { validateFunctionNameInput } from "./index";

describe("validateFunctionNameInput", () => {
  it("returns required for empty input", () => {
    expect(validateFunctionNameInput("")).toBe("required");
    expect(validateFunctionNameInput("   ")).toBe("required");
  });

  it("accepts valid names", () => {
    expect(validateFunctionNameInput("my-function")).toBeNull();
    expect(validateFunctionNameInput("a")).toBeNull();
    expect(validateFunctionNameInput("my_function_123")).toBeNull();
    expect(validateFunctionNameInput("A".repeat(64))).toBeNull();
  });

  it("rejects names with invalid characters", () => {
    expect(validateFunctionNameInput("my function!")).toBe("invalidPattern");
    expect(validateFunctionNameInput("bad:name")).toBe("invalidPattern");
    expect(validateFunctionNameInput("name.with.dots")).toBe("invalidPattern");
  });

  it("rejects names exceeding 64 characters", () => {
    expect(validateFunctionNameInput("a".repeat(65))).toBe("tooLong");
    expect(validateFunctionNameInput("a".repeat(100))).toBe("tooLong");
  });
});
