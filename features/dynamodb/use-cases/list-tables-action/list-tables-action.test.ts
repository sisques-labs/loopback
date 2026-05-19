import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("@/features/dynamodb/services/list-tables/list-tables", () => ({
  listTables: vi.fn(),
}));

import { listTables } from "@/features/dynamodb/services/list-tables/list-tables";
import { listTablesAction } from "./list-tables-action";
import type { DynamoDBTable } from "@/features/dynamodb/types/dynamodb";

const mockTables: DynamoDBTable[] = [
  {
    name: "alpha-table",
    status: "ACTIVE",
    itemCount: 10,
    tableSizeBytes: 1024,
    partitionKeyName: "pk",
    partitionKeyType: "S",
  },
  {
    name: "beta-table",
    status: "ACTIVE",
    itemCount: 0,
    tableSizeBytes: 0,
    partitionKeyName: "id",
    partitionKeyType: "N",
  },
];

beforeEach(() => {
  vi.clearAllMocks();
});

describe("listTablesAction — success branch", () => {
  it("calls listTables() and returns the table array", async () => {
    vi.mocked(listTables).mockResolvedValue(mockTables);

    const result = await listTablesAction();

    expect(listTables).toHaveBeenCalledOnce();
    expect(result).toEqual(mockTables);
  });

  it("returns an empty array when there are no tables", async () => {
    vi.mocked(listTables).mockResolvedValue([]);

    const result = await listTablesAction();

    expect(result).toEqual([]);
  });
});

describe("listTablesAction — error branch", () => {
  it("re-throws errors from the underlying service", async () => {
    const error = Object.assign(new Error("Connection refused"), { name: "EndpointError" });
    vi.mocked(listTables).mockRejectedValue(error);

    await expect(listTablesAction()).rejects.toThrow("Connection refused");
  });
});
