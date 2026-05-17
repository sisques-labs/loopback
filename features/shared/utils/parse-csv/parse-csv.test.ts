import { describe, expect, it } from "vitest";
import { parseCSV } from "./parse-csv";

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

  it("handles Windows-style CRLF line endings", () => {
    const csv = "id,name\r\n1,Widget\r\n2,Gadget";
    const result = parseCSV(csv);
    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({ id: "1", name: "Widget" });
  });
});
