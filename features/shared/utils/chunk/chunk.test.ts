import { describe, expect, it } from "vitest";
import { chunk } from "./chunk";

describe("chunk", () => {
  it("splits array into chunks of given size", () => {
    expect(chunk([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]]);
  });

  it("last chunk is smaller when array length is not a multiple of size", () => {
    const result = chunk(Array.from({ length: 26 }, (_, i) => i), 25);
    expect(result).toHaveLength(2);
    expect(result[0]).toHaveLength(25);
    expect(result[1]).toHaveLength(1);
  });

  it("returns one chunk when array fits within size", () => {
    expect(chunk([1, 2, 3], 25)).toEqual([[1, 2, 3]]);
  });

  it("returns empty array for empty input", () => {
    expect(chunk([], 25)).toEqual([]);
  });

  it("defaults to size 25", () => {
    const arr = Array.from({ length: 60 }, (_, i) => i);
    const result = chunk(arr);
    expect(result).toHaveLength(3);
    expect(result[0]).toHaveLength(25);
    expect(result[1]).toHaveLength(25);
    expect(result[2]).toHaveLength(10);
  });

  it("works with generic types", () => {
    const result = chunk(["a", "b", "c"], 2);
    expect(result).toEqual([["a", "b"], ["c"]]);
  });
});
