import { afterEach, describe, expect, it, vi } from "vitest";

// ─── mocks ────────────────────────────────────────────────────────────────────

const mockCookiesGet = vi.fn();

vi.mock("next/headers", () => ({
  cookies: vi.fn(() => ({
    get: mockCookiesGet,
  })),
}));

vi.mock("server-only", () => ({}));

// ─── import after mocks ────────────────────────────────────────────────────────

import { exportProfilesAction } from "./export-profiles";
import type { Profile } from "@/lib/aws/profiles";

const profiles: Profile[] = [
  { id: "id-1", name: "dev", endpoint: "http://localhost:4566", region: "us-east-1" },
  { id: "id-2", name: "staging", endpoint: "http://staging:4566", region: "eu-west-1" },
];

afterEach(() => {
  vi.clearAllMocks();
});

describe("exportProfilesAction", () => {
  it("returns a valid JSON string of all profiles", async () => {
    mockCookiesGet.mockReturnValue({ value: JSON.stringify(profiles) });

    const result = await exportProfilesAction();

    expect(result.status).toBe("success");
    const parsed = JSON.parse((result as { status: "success"; data: string }).data);
    expect(Array.isArray(parsed)).toBe(true);
    expect(parsed).toHaveLength(2);
  });

  it("returns only id, name, endpoint, region — no credential fields", async () => {
    mockCookiesGet.mockReturnValue({ value: JSON.stringify(profiles) });

    const result = await exportProfilesAction();
    expect(result.status).toBe("success");
    const parsed = JSON.parse((result as { status: "success"; data: string }).data) as Profile[];

    for (const item of parsed) {
      expect(Object.keys(item).sort()).toEqual(["endpoint", "id", "name", "region"]);
    }
  });

  it("does NOT include any active profile ID field", async () => {
    mockCookiesGet.mockReturnValue({ value: JSON.stringify(profiles) });

    const result = await exportProfilesAction();
    expect(result.status).toBe("success");
    const parsed = JSON.parse((result as { status: "success"; data: string }).data);

    // The returned array is profiles only — no wrapper object with activeProfileId
    expect(Array.isArray(parsed)).toBe(true);
  });

  it("returns empty array JSON when no profiles cookie exists", async () => {
    mockCookiesGet.mockReturnValue(undefined);

    const result = await exportProfilesAction();

    expect(result.status).toBe("success");
    const parsed = JSON.parse((result as { status: "success"; data: string }).data);
    expect(parsed).toEqual([]);
  });

  it("returns empty array JSON when profiles cookie is empty", async () => {
    mockCookiesGet.mockReturnValue({ value: "" });

    const result = await exportProfilesAction();

    expect(result.status).toBe("success");
    const parsed = JSON.parse((result as { status: "success"; data: string }).data);
    expect(parsed).toEqual([]);
  });

  it("the returned JSON is parseable", async () => {
    mockCookiesGet.mockReturnValue({ value: JSON.stringify(profiles) });

    const result = await exportProfilesAction();
    expect(result.status).toBe("success");

    expect(() =>
      JSON.parse((result as { status: "success"; data: string }).data),
    ).not.toThrow();
  });
});
