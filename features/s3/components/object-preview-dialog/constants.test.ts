import { describe, expect, it } from "vitest";
import { TEXT_PREVIEW_MAX_BYTES } from "./constants";

describe("constants", () => {
  it("TEXT_PREVIEW_MAX_BYTES equals 1048576", () => {
    expect(TEXT_PREVIEW_MAX_BYTES).toBe(1_048_576);
  });
});
