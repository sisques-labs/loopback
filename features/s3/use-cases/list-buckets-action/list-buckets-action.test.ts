import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("@/features/s3/services/list-buckets/list-buckets", () => ({
  listBuckets: vi.fn(),
}));

import { listBuckets } from "@/features/s3/services/list-buckets/list-buckets";
import { listBucketsAction } from "./list-buckets-action";
import type { Bucket } from "@/features/s3/types/s3";

const mockBuckets: Bucket[] = [
  { name: "alpha-bucket", createdAt: "2024-01-01T00:00:00.000Z" },
  { name: "beta-bucket", createdAt: "2024-02-01T00:00:00.000Z" },
];

beforeEach(() => {
  vi.clearAllMocks();
});

describe("listBucketsAction — success branch", () => {
  it("calls listBuckets() and returns the bucket array", async () => {
    vi.mocked(listBuckets).mockResolvedValue(mockBuckets);

    const result = await listBucketsAction();

    expect(listBuckets).toHaveBeenCalledOnce();
    expect(result).toEqual(mockBuckets);
  });

  it("returns an empty array when there are no buckets", async () => {
    vi.mocked(listBuckets).mockResolvedValue([]);

    const result = await listBucketsAction();

    expect(result).toEqual([]);
  });
});

describe("listBucketsAction — error branch", () => {
  it("re-throws errors from the underlying service", async () => {
    const error = Object.assign(new Error("Connection refused"), { name: "EndpointError" });
    vi.mocked(listBuckets).mockRejectedValue(error);

    await expect(listBucketsAction()).rejects.toThrow("Connection refused");
  });
});
