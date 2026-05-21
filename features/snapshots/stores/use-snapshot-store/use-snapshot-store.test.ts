import { describe, beforeEach, expect, it } from "vitest";
import type { SnapshotDocument, RestoreReport } from "@/features/snapshots/lib/types/snapshot";
import { useSnapshotStore } from "./use-snapshot-store";

const mockDoc: SnapshotDocument = {
  version: "1",
  createdAt: "2024-01-15T10:30:00Z",
  endpoint: "http://localhost:4566",
  dynamodb: [
    {
      tableName: "Users",
      billingMode: "PAY_PER_REQUEST",
      attributeDefinitions: [{ name: "pk", type: "S" }],
      keySchema: [{ name: "pk", keyType: "HASH" }],
      items: [{ pk: "user-1" }],
      itemCount: 1,
    },
  ],
  sqs: [],
  s3: [],
};

const mockReport: RestoreReport = {
  services: [
    {
      service: "dynamodb",
      resources: [{ name: "Users", status: "created" }],
    },
  ],
};

describe("useSnapshotStore — initial state", () => {
  beforeEach(() => {
    useSnapshotStore.setState({
      snapshot: null,
      status: "idle",
      restoreReport: null,
      errorMessage: null,
    });
  });

  it("snapshot is null initially", () => {
    expect(useSnapshotStore.getState().snapshot).toBeNull();
  });

  it("status is idle initially", () => {
    expect(useSnapshotStore.getState().status).toBe("idle");
  });

  it("restoreReport is null initially", () => {
    expect(useSnapshotStore.getState().restoreReport).toBeNull();
  });

  it("errorMessage is null initially", () => {
    expect(useSnapshotStore.getState().errorMessage).toBeNull();
  });
});

describe("useSnapshotStore — setSnapshot", () => {
  beforeEach(() => {
    useSnapshotStore.setState({
      snapshot: null,
      status: "idle",
      restoreReport: null,
      errorMessage: null,
    });
  });

  it("setSnapshot stores the document", () => {
    useSnapshotStore.getState().setSnapshot(mockDoc);
    expect(useSnapshotStore.getState().snapshot).toEqual(mockDoc);
  });

  it("setSnapshot replaces any previously stored document", () => {
    const firstDoc: SnapshotDocument = { ...mockDoc, endpoint: "http://other:4566" };
    useSnapshotStore.getState().setSnapshot(firstDoc);
    useSnapshotStore.getState().setSnapshot(mockDoc);
    expect(useSnapshotStore.getState().snapshot?.endpoint).toBe("http://localhost:4566");
  });
});

describe("useSnapshotStore — clearSnapshot", () => {
  beforeEach(() => {
    useSnapshotStore.setState({
      snapshot: mockDoc,
      status: "done",
      restoreReport: null,
      errorMessage: null,
    });
  });

  it("clearSnapshot sets snapshot to null", () => {
    useSnapshotStore.getState().clearSnapshot();
    expect(useSnapshotStore.getState().snapshot).toBeNull();
  });

  it("clearSnapshot does not reset status", () => {
    useSnapshotStore.getState().clearSnapshot();
    expect(useSnapshotStore.getState().status).toBe("done");
  });
});

describe("useSnapshotStore — setStatus", () => {
  beforeEach(() => {
    useSnapshotStore.setState({
      snapshot: null,
      status: "idle",
      restoreReport: null,
      errorMessage: null,
    });
  });

  it("setStatus(creating) sets status to creating", () => {
    useSnapshotStore.getState().setStatus("creating");
    expect(useSnapshotStore.getState().status).toBe("creating");
  });

  it("setStatus(restoring) sets status to restoring", () => {
    useSnapshotStore.getState().setStatus("restoring");
    expect(useSnapshotStore.getState().status).toBe("restoring");
  });

  it("setStatus(done) sets status to done", () => {
    useSnapshotStore.getState().setStatus("done");
    expect(useSnapshotStore.getState().status).toBe("done");
  });

  it("setStatus(error) sets status to error", () => {
    useSnapshotStore.getState().setStatus("error");
    expect(useSnapshotStore.getState().status).toBe("error");
  });
});

describe("useSnapshotStore — setRestoreReport", () => {
  beforeEach(() => {
    useSnapshotStore.setState({
      snapshot: null,
      status: "idle",
      restoreReport: null,
      errorMessage: null,
    });
  });

  it("setRestoreReport stores the report", () => {
    useSnapshotStore.getState().setRestoreReport(mockReport);
    expect(useSnapshotStore.getState().restoreReport).toEqual(mockReport);
  });

  it("setRestoreReport services array is accessible", () => {
    useSnapshotStore.getState().setRestoreReport(mockReport);
    expect(useSnapshotStore.getState().restoreReport?.services).toHaveLength(1);
    expect(useSnapshotStore.getState().restoreReport?.services[0].service).toBe("dynamodb");
  });
});

describe("useSnapshotStore — setError", () => {
  beforeEach(() => {
    useSnapshotStore.setState({
      snapshot: null,
      status: "idle",
      restoreReport: null,
      errorMessage: null,
    });
  });

  it("setError stores the error message", () => {
    useSnapshotStore.getState().setError("Something went wrong");
    expect(useSnapshotStore.getState().errorMessage).toBe("Something went wrong");
  });

  it("setError with different message replaces the previous one", () => {
    useSnapshotStore.getState().setError("First error");
    useSnapshotStore.getState().setError("Second error");
    expect(useSnapshotStore.getState().errorMessage).toBe("Second error");
  });
});

describe("useSnapshotStore — reset", () => {
  beforeEach(() => {
    useSnapshotStore.setState({
      snapshot: mockDoc,
      status: "done",
      restoreReport: mockReport,
      errorMessage: "previous error",
    });
  });

  it("reset sets snapshot to null", () => {
    useSnapshotStore.getState().reset();
    expect(useSnapshotStore.getState().snapshot).toBeNull();
  });

  it("reset sets status to idle", () => {
    useSnapshotStore.getState().reset();
    expect(useSnapshotStore.getState().status).toBe("idle");
  });

  it("reset sets restoreReport to null", () => {
    useSnapshotStore.getState().reset();
    expect(useSnapshotStore.getState().restoreReport).toBeNull();
  });

  it("reset sets errorMessage to null", () => {
    useSnapshotStore.getState().reset();
    expect(useSnapshotStore.getState().errorMessage).toBeNull();
  });
});
