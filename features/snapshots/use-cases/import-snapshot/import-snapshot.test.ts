import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { importSnapshotAction } from "./import-snapshot";
import type { ActionState } from "@/features/shared/types/action-state";
import type { SnapshotDocument } from "@/features/snapshots/lib/types/snapshot";

const IDLE: ActionState<SnapshotDocument> = { status: "idle" };

const VALID_SNAPSHOT: SnapshotDocument = {
  version: "1",
  createdAt: new Date().toISOString(),
  endpoint: "http://localhost:4566",
  dynamodb: [],
  sqs: [],
  s3: [],
};

function makeFileFormData(content: string, fileName = "snapshot.json"): FormData {
  const file = new File([content], fileName, { type: "application/json" });
  const fd = new FormData();
  fd.set("file", file);
  return fd;
}

describe("importSnapshotAction", () => {
  it("returns success with SnapshotDocument when valid JSON is provided", async () => {
    const fd = makeFileFormData(JSON.stringify(VALID_SNAPSHOT));
    const result = await importSnapshotAction(IDLE, fd);

    expect(result.status).toBe("success");
    if (result.status === "success") {
      expect(result.data.version).toBe("1");
      expect(result.data.endpoint).toBe("http://localhost:4566");
    }
  });

  it("returns error when version field is missing", async () => {
    const invalid = { createdAt: new Date().toISOString(), endpoint: "x", dynamodb: [], sqs: [], s3: [] };
    const fd = makeFileFormData(JSON.stringify(invalid));
    const result = await importSnapshotAction(IDLE, fd);

    expect(result.status).toBe("error");
  });

  it("returns error when JSON is malformed", async () => {
    const fd = makeFileFormData("{ not valid json }}}");
    const result = await importSnapshotAction(IDLE, fd);

    expect(result.status).toBe("error");
  });

  it("returns error when no file is provided", async () => {
    const fd = new FormData();
    const result = await importSnapshotAction(IDLE, fd);

    expect(result.status).toBe("error");
  });
});
