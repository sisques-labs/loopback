import { describe, expect, it } from "vitest";
import { POST } from "./route";
import type { SnapshotDocument } from "@/features/snapshots/lib/types/snapshot";

const VALID_SNAPSHOT: SnapshotDocument = {
  version: "1",
  createdAt: "2024-01-15T00:00:00.000Z",
  endpoint: "http://localhost:4566",
  dynamodb: [],
  sqs: [],
  s3: [],
};

function makeRequest(body: unknown) {
  return new Request("http://localhost/api/snapshots/export", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/snapshots/export", () => {
  it("returns 200 with attachment Content-Disposition for a valid snapshot", async () => {
    const req = makeRequest({ snapshot: VALID_SNAPSHOT });
    const res = await POST(req as never);

    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toContain("application/json");

    const disposition = res.headers.get("Content-Disposition");
    expect(disposition).toContain("attachment");
    expect(disposition).toContain("loopback-snapshot-");
    expect(disposition).toContain(".json");
  });

  it("returns 400 for invalid snapshot body (missing version)", async () => {
    const invalid = { snapshot: { createdAt: "x", endpoint: "y", dynamodb: [], sqs: [], s3: [] } };
    const req = makeRequest(invalid);
    const res = await POST(req as never);

    expect(res.status).toBe(400);
  });

  it("returns 400 when snapshot key is missing from body", async () => {
    const req = makeRequest({});
    const res = await POST(req as never);

    expect(res.status).toBe(400);
  });

  it("returned JSON body contains the snapshot data", async () => {
    const req = makeRequest({ snapshot: VALID_SNAPSHOT });
    const res = await POST(req as never);

    const text = await res.text();
    const parsed = JSON.parse(text);
    expect(parsed.version).toBe("1");
    expect(parsed.endpoint).toBe("http://localhost:4566");
  });
});
