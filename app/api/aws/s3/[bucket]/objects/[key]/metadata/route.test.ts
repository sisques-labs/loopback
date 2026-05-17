import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/features/s3/services/head-object/head-object", () => ({
  headObject: vi.fn(),
}));

vi.mock("@/lib/aws/errors", () => ({
  toFriendlyError: vi.fn(),
}));

import { headObject } from "@/features/s3/services/head-object/head-object";
import { toFriendlyError } from "@/lib/aws/errors";
import { GET } from "./route";

const mockHeadObject = vi.mocked(headObject);
const mockToFriendlyError = vi.mocked(toFriendlyError);

const bucket = "my-bucket";
const key = "file.txt";

function makeCtx() {
  return { params: Promise.resolve({ bucket, key }) };
}

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  vi.clearAllMocks();
});

describe("GET /api/aws/s3/[bucket]/objects/[key]/metadata", () => {
  it("returns 200 with { ok: true, data } when headObject resolves an object", async () => {
    const mockObject = {
      key: "file.txt",
      size: 1024,
      lastModified: "2024-01-01T00:00:00.000Z",
      etag: '"abc123"',
      storageClass: "STANDARD",
      contentType: "text/plain",
      metadata: { env: "staging" },
    };
    mockHeadObject.mockResolvedValue(mockObject);

    const res = await GET({} as never, makeCtx());
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.ok).toBe(true);
    expect(body.data).toEqual(mockObject);
    expect(body.data.metadata).toEqual({ env: "staging" });
  });

  it("returns 404 with code NoSuchKey when headObject returns null", async () => {
    mockHeadObject.mockResolvedValue(null);

    const res = await GET({} as never, makeCtx());
    expect(res.status).toBe(404);

    const body = await res.json();
    expect(body.ok).toBe(false);
    expect(body.code).toBe("NoSuchKey");
    expect(typeof body.error).toBe("string");
  });

  it("returns 500 with friendly error when headObject throws", async () => {
    const err = new Error("Connection refused");
    mockHeadObject.mockRejectedValue(err);
    mockToFriendlyError.mockReturnValue({ code: "EndpointUnreachable", message: "Cannot connect to LocalStack." });

    const res = await GET({} as never, makeCtx());
    expect(res.status).toBe(500);

    const body = await res.json();
    expect(body.ok).toBe(false);
    expect(body.code).toBe("EndpointUnreachable");
    expect(body.error).toBe("Cannot connect to LocalStack.");
  });
});
