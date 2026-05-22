import { afterEach, describe, expect, it, vi } from "vitest";

// ─── mocks ────────────────────────────────────────────────────────────────────

const mockCookiesGet = vi.fn();
const mockCookiesSet = vi.fn();

vi.mock("next/headers", () => ({
  cookies: vi.fn(() => ({
    get: mockCookiesGet,
    set: mockCookiesSet,
  })),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("server-only", () => ({}));

// ─── import after mocks ────────────────────────────────────────────────────────

import { importProfilesAction } from "./import-profiles";
import { revalidatePath } from "next/cache";
import type { Profile } from "@/lib/aws/profiles";
import { MAX_PROFILES } from "@/lib/aws/profiles";

const existingProfiles: Profile[] = [
  { id: "existing-id", name: "existing", endpoint: "http://localhost:4566", region: "us-east-1" },
];

afterEach(() => {
  vi.clearAllMocks();
});

describe("importProfilesAction — success cases", () => {
  it("adds valid profiles from JSON to existing profiles cookie", async () => {
    mockCookiesGet.mockReturnValue({ value: JSON.stringify(existingProfiles) });

    const newProfiles: Profile[] = [
      { id: "new-id", name: "dev", endpoint: "http://dev:4566", region: "eu-west-1" },
    ];

    const result = await importProfilesAction(JSON.stringify(newProfiles));

    expect(result.status).toBe("success");
    expect(mockCookiesSet).toHaveBeenCalledOnce();
  });

  it("returns imported count in success data", async () => {
    mockCookiesGet.mockReturnValue({ value: JSON.stringify(existingProfiles) });

    const newProfiles: Profile[] = [
      { id: "n1", name: "dev", endpoint: "http://dev:4566", region: "eu-west-1" },
      { id: "n2", name: "staging", endpoint: "http://staging:4566", region: "us-west-2" },
    ];

    const result = await importProfilesAction(JSON.stringify(newProfiles));

    expect(result.status).toBe("success");
    const data = (result as { status: "success"; data: { imported: number; skipped: number } }).data;
    expect(data.imported).toBe(2);
    expect(data.skipped).toBe(0);
  });

  it("skips profiles whose name already exists in current profiles", async () => {
    mockCookiesGet.mockReturnValue({ value: JSON.stringify(existingProfiles) });

    const duplicateInput: Profile[] = [
      { id: "dup-id", name: "existing", endpoint: "http://other:4566", region: "us-east-1" },
      { id: "new-id", name: "dev", endpoint: "http://dev:4566", region: "eu-west-1" },
    ];

    const result = await importProfilesAction(JSON.stringify(duplicateInput));

    expect(result.status).toBe("success");
    const data = (result as { status: "success"; data: { imported: number; skipped: number } }).data;
    expect(data.imported).toBe(1);
    expect(data.skipped).toBe(1);
  });

  it("respects MAX_PROFILES cap — truncates to fit", async () => {
    // Fill up to 9 profiles already
    const nearCapProfiles: Profile[] = Array.from({ length: 9 }, (_, i) => ({
      id: `id-${i}`,
      name: `profile-${i}`,
      endpoint: "http://localhost:4566",
      region: "us-east-1",
    }));
    mockCookiesGet.mockReturnValue({ value: JSON.stringify(nearCapProfiles) });

    // Try to import 3 — only 1 should fit (MAX_PROFILES = 10)
    const toImport: Profile[] = [
      { id: "new-1", name: "a", endpoint: "http://a:4566", region: "us-east-1" },
      { id: "new-2", name: "b", endpoint: "http://b:4566", region: "us-east-1" },
      { id: "new-3", name: "c", endpoint: "http://c:4566", region: "us-east-1" },
    ];

    const result = await importProfilesAction(JSON.stringify(toImport));

    expect(result.status).toBe("success");
    const data = (result as { status: "success"; data: { imported: number; skipped: number } }).data;
    expect(data.imported).toBe(1);
    expect(data.skipped).toBe(2);
  });

  it("revalidates path on success", async () => {
    mockCookiesGet.mockReturnValue({ value: JSON.stringify(existingProfiles) });

    const newProfiles: Profile[] = [
      { id: "n1", name: "dev", endpoint: "http://dev:4566", region: "eu-west-1" },
    ];

    await importProfilesAction(JSON.stringify(newProfiles));

    expect(revalidatePath).toHaveBeenCalled();
  });

  it("sets cookie with correct options (httpOnly, sameSite lax, path /, maxAge 365d)", async () => {
    mockCookiesGet.mockReturnValue(undefined);

    const newProfiles: Profile[] = [
      { id: "n1", name: "dev", endpoint: "http://dev:4566", region: "eu-west-1" },
    ];

    await importProfilesAction(JSON.stringify(newProfiles));

    const cookieOptions = mockCookiesSet.mock.calls[0]?.[2];
    expect(cookieOptions).toMatchObject({
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
    });
  });
});

describe("importProfilesAction — error cases", () => {
  it("returns error for invalid JSON input", async () => {
    mockCookiesGet.mockReturnValue(undefined);

    const result = await importProfilesAction("not valid json {{{");

    expect(result.status).toBe("error");
    expect((result as { status: "error"; message: string }).message).toBeTruthy();
  });

  it("returns error when parsed array has no valid Profile items", async () => {
    mockCookiesGet.mockReturnValue(undefined);

    // Objects missing required fields
    const badData = [{ foo: "bar" }, { baz: 42 }];
    const result = await importProfilesAction(JSON.stringify(badData));

    expect(result.status).toBe("error");
    expect((result as { status: "error"; message: string }).message).toBeTruthy();
  });

  it("returns error for non-array JSON (e.g., object or string)", async () => {
    mockCookiesGet.mockReturnValue(undefined);

    const result = await importProfilesAction(JSON.stringify({ profiles: [] }));

    expect(result.status).toBe("error");
  });

  it("does NOT call cookies set on error", async () => {
    mockCookiesGet.mockReturnValue(undefined);

    await importProfilesAction("{ invalid json");

    expect(mockCookiesSet).not.toHaveBeenCalled();
  });
});

describe("importProfilesAction — cap boundary", () => {
  it("skips all imports when already at MAX_PROFILES", async () => {
    const atCapProfiles: Profile[] = Array.from({ length: MAX_PROFILES }, (_, i) => ({
      id: `id-${i}`,
      name: `profile-${i}`,
      endpoint: "http://localhost:4566",
      region: "us-east-1",
    }));
    mockCookiesGet.mockReturnValue({ value: JSON.stringify(atCapProfiles) });

    const toImport: Profile[] = [
      { id: "new-id", name: "dev", endpoint: "http://dev:4566", region: "eu-west-1" },
    ];

    const result = await importProfilesAction(JSON.stringify(toImport));

    expect(result.status).toBe("success");
    const data = (result as { status: "success"; data: { imported: number; skipped: number } }).data;
    expect(data.imported).toBe(0);
    expect(data.skipped).toBe(1);
  });
});

describe("importProfilesAction — cookie secure flag", () => {
  it("sets secure: true on cookie when NODE_ENV is production", async () => {
    mockCookiesGet.mockReturnValue(undefined);
    const original = process.env.NODE_ENV;

    try {
      // @ts-expect-error — overriding read-only env for test
      process.env.NODE_ENV = "production";
      const newProfiles: Profile[] = [
        { id: "n1", name: "dev", endpoint: "http://dev:4566", region: "eu-west-1" },
      ];
      await importProfilesAction(JSON.stringify(newProfiles));
      const cookieOptions = mockCookiesSet.mock.calls[0]?.[2];
      expect(cookieOptions).toMatchObject({ secure: true });
    } finally {
      // @ts-expect-error — restoring env
      process.env.NODE_ENV = original;
    }
  });
});
