import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@aws-sdk/client-s3", () => ({
  HeadObjectCommand: vi.fn().mockImplementation((input) => ({ input })),
}));

vi.mock("@/lib/aws/client-factory", () => ({
  getS3Client: vi.fn(),
}));

vi.mock("@/lib/aws/errors", () => ({
  toFriendlyError: (err: unknown) => {
    if (err instanceof Error && err.message === "NoSuchKey") {
      return { code: "NoSuchKey", message: "No such key" };
    }
    return { code: "UnknownError", message: String(err) };
  },
}));

import { headObject } from "./head-object";
import { getS3Client } from "@/lib/aws/client-factory";

const mockSend = vi.fn();
const mockClient = { send: mockSend };

beforeEach(() => {
  vi.clearAllMocks();
  (getS3Client as ReturnType<typeof vi.fn>).mockReturnValue(mockClient);
});

describe("headObject", () => {
  it("maps ContentType from SDK response", async () => {
    mockSend.mockResolvedValue({
      ContentLength: 1024,
      LastModified: new Date("2024-01-01T00:00:00Z"),
      ETag: '"abc123"',
      StorageClass: "STANDARD",
      ContentType: "image/png",
    });

    const result = await headObject("my-bucket", "photo.png");
    expect(result).not.toBeNull();
    expect(result!.contentType).toBe("image/png");
  });

  it("maps contentType as undefined when ContentType is absent", async () => {
    mockSend.mockResolvedValue({
      ContentLength: 512,
      LastModified: new Date("2024-01-01T00:00:00Z"),
      ETag: '"def456"',
      StorageClass: "STANDARD",
    });

    const result = await headObject("my-bucket", "file.bin");
    expect(result).not.toBeNull();
    expect(result!.contentType).toBeUndefined();
  });

  it("still maps key, size, lastModified, etag, storageClass correctly", async () => {
    const lastModified = new Date("2024-06-15T12:00:00Z");
    mockSend.mockResolvedValue({
      ContentLength: 2048,
      LastModified: lastModified,
      ETag: '"etag-val"',
      StorageClass: "GLACIER",
      ContentType: "text/plain",
    });

    const result = await headObject("my-bucket", "doc.txt");
    expect(result).not.toBeNull();
    expect(result!.key).toBe("doc.txt");
    expect(result!.size).toBe(2048);
    expect(result!.lastModified).toBe(lastModified.toISOString());
    expect(result!.etag).toBe('"etag-val"');
    expect(result!.storageClass).toBe("GLACIER");
  });

  it("returns null when NoSuchKey error is thrown", async () => {
    mockSend.mockRejectedValue(Object.assign(new Error("NoSuchKey"), {}));

    const result = await headObject("my-bucket", "missing.txt");
    expect(result).toBeNull();
  });
});
