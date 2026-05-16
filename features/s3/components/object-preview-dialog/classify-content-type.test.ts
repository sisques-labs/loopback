import { describe, expect, it } from "vitest";
import { classifyContentType } from "./classify-content-type";

describe("classifyContentType", () => {
  // Image MIMEs
  it("classifies image/png as image", () => {
    expect(classifyContentType("image/png")).toBe("image");
  });

  it("classifies image/jpeg as image", () => {
    expect(classifyContentType("image/jpeg")).toBe("image");
  });

  it("classifies image/gif as image", () => {
    expect(classifyContentType("image/gif")).toBe("image");
  });

  it("classifies image/webp as image", () => {
    expect(classifyContentType("image/webp")).toBe("image");
  });

  it("classifies image/svg+xml as image", () => {
    expect(classifyContentType("image/svg+xml")).toBe("image");
  });

  // Text MIMEs
  it("classifies text/plain as text", () => {
    expect(classifyContentType("text/plain")).toBe("text");
  });

  it("classifies text/csv as text", () => {
    expect(classifyContentType("text/csv")).toBe("text");
  });

  it("classifies text/html as text", () => {
    expect(classifyContentType("text/html")).toBe("text");
  });

  it("classifies application/json as text", () => {
    expect(classifyContentType("application/json")).toBe("text");
  });

  it("classifies application/xml as text", () => {
    expect(classifyContentType("application/xml")).toBe("text");
  });

  it("classifies application/x-yaml as text", () => {
    expect(classifyContentType("application/x-yaml")).toBe("text");
  });

  // Unsupported
  it("classifies application/octet-stream as unsupported (no key)", () => {
    expect(classifyContentType("application/octet-stream")).toBe("unsupported");
  });

  it("classifies undefined as unsupported (no key)", () => {
    expect(classifyContentType(undefined)).toBe("unsupported");
  });

  // Extension fallback — octet-stream + key
  it("falls back to text for .md extension with octet-stream", () => {
    expect(classifyContentType("application/octet-stream", "file.md")).toBe("text");
  });

  it("falls back to image for .jpg extension with undefined contentType", () => {
    expect(classifyContentType(undefined, "photo.jpg")).toBe("image");
  });

  it("falls back to image for .svg extension with octet-stream", () => {
    expect(classifyContentType("application/octet-stream", "image.svg")).toBe("image");
  });

  it("falls back to text for .csv extension with undefined contentType", () => {
    expect(classifyContentType(undefined, "data.csv")).toBe("text");
  });

  it("falls back to unsupported for .zip extension with octet-stream", () => {
    expect(classifyContentType("application/octet-stream", "archive.zip")).toBe("unsupported");
  });
});
