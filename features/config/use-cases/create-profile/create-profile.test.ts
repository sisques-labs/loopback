import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("next/headers", () => ({
  cookies: vi.fn(),
}));
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { createProfileAction } from "./create-profile";
import type { ActionState } from "@/features/shared/types/action-state";
import { serializeProfiles } from "@/lib/aws/profiles";
import type { Profile } from "@/lib/aws/profiles";

type CookieStore = Awaited<ReturnType<typeof cookies>>;

function makeCookieStore(profilesValue?: string) {
  return {
    get: vi.fn((name: string) => {
      if (name === "aws-profiles") {
        return profilesValue !== undefined ? { value: profilesValue } : undefined;
      }
      return undefined;
    }),
    set: vi.fn(),
    delete: vi.fn(),
  };
}

function buildFormData(fields: Record<string, string>): FormData {
  const fd = new FormData();
  for (const [k, v] of Object.entries(fields)) {
    fd.append(k, v);
  }
  return fd;
}

const idle: ActionState = { status: "idle" };

const validInput = {
  name: "dev",
  endpoint: "http://localhost:4566",
  region: "us-east-1",
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.spyOn(crypto, "randomUUID").mockReturnValue("test-uuid-1234" as ReturnType<typeof crypto.randomUUID>);
});

describe("createProfileAction — success", () => {
  it("returns success for valid input with empty profiles list", async () => {
    const store = makeCookieStore(undefined);
    vi.mocked(cookies).mockResolvedValue(store as unknown as CookieStore);

    const result = await createProfileAction(idle, buildFormData(validInput));

    expect(result.status).toBe("success");
  });

  it("sets aws-profiles cookie with the new profile appended", async () => {
    const store = makeCookieStore(undefined);
    vi.mocked(cookies).mockResolvedValue(store as unknown as CookieStore);

    await createProfileAction(idle, buildFormData(validInput));

    expect(store.set).toHaveBeenCalledWith(
      "aws-profiles",
      expect.stringContaining('"name":"dev"'),
      expect.objectContaining({ httpOnly: true }),
    );
  });

  it("assigns a UUID as the profile id", async () => {
    const store = makeCookieStore(undefined);
    vi.mocked(cookies).mockResolvedValue(store as unknown as CookieStore);

    await createProfileAction(idle, buildFormData(validInput));

    expect(store.set).toHaveBeenCalledWith(
      "aws-profiles",
      expect.stringContaining('"id":"test-uuid-1234"'),
      expect.any(Object),
    );
  });

  it("appends to existing profiles", async () => {
    const existing: Profile[] = [
      { id: "existing-id", name: "staging", endpoint: "http://staging:4566", region: "eu-west-1" },
    ];
    const store = makeCookieStore(serializeProfiles(existing));
    vi.mocked(cookies).mockResolvedValue(store as unknown as CookieStore);

    await createProfileAction(idle, buildFormData(validInput));

    const savedValue = (store.set as ReturnType<typeof vi.fn>).mock.calls[0][1] as string;
    const saved: Profile[] = JSON.parse(savedValue);
    expect(saved).toHaveLength(2);
    expect(saved[0].name).toBe("staging");
    expect(saved[1].name).toBe("dev");
  });

  it("calls revalidatePath on success", async () => {
    const store = makeCookieStore(undefined);
    vi.mocked(cookies).mockResolvedValue(store as unknown as CookieStore);

    await createProfileAction(idle, buildFormData(validInput));

    expect(revalidatePath).toHaveBeenCalledWith("/", "layout");
  });
});

describe("createProfileAction — validation errors", () => {
  it("returns error for empty name", async () => {
    const store = makeCookieStore(undefined);
    vi.mocked(cookies).mockResolvedValue(store as unknown as CookieStore);

    const result = await createProfileAction(
      idle,
      buildFormData({ ...validInput, name: "" }),
    );

    expect(result.status).toBe("error");
  });

  it("returns error for name exceeding 64 characters", async () => {
    const store = makeCookieStore(undefined);
    vi.mocked(cookies).mockResolvedValue(store as unknown as CookieStore);

    const result = await createProfileAction(
      idle,
      buildFormData({ ...validInput, name: "a".repeat(65) }),
    );

    expect(result.status).toBe("error");
  });

  it("returns error for invalid endpoint URL", async () => {
    const store = makeCookieStore(undefined);
    vi.mocked(cookies).mockResolvedValue(store as unknown as CookieStore);

    const result = await createProfileAction(
      idle,
      buildFormData({ ...validInput, endpoint: "not-a-url" }),
    );

    expect(result.status).toBe("error");
  });

  it("returns error for invalid region", async () => {
    const store = makeCookieStore(undefined);
    vi.mocked(cookies).mockResolvedValue(store as unknown as CookieStore);

    const result = await createProfileAction(
      idle,
      buildFormData({ ...validInput, region: "xx-invalid-1" }),
    );

    expect(result.status).toBe("error");
  });

  it("returns error for duplicate name", async () => {
    const existing: Profile[] = [
      { id: "existing-id", name: "dev", endpoint: "http://localhost:4566", region: "us-east-1" },
    ];
    const store = makeCookieStore(serializeProfiles(existing));
    vi.mocked(cookies).mockResolvedValue(store as unknown as CookieStore);

    const result = await createProfileAction(idle, buildFormData(validInput));

    expect(result.status).toBe("error");
  });

  it("does NOT modify cookie on duplicate name", async () => {
    const existing: Profile[] = [
      { id: "existing-id", name: "dev", endpoint: "http://localhost:4566", region: "us-east-1" },
    ];
    const store = makeCookieStore(serializeProfiles(existing));
    vi.mocked(cookies).mockResolvedValue(store as unknown as CookieStore);

    await createProfileAction(idle, buildFormData(validInput));

    expect(store.set).not.toHaveBeenCalled();
  });

  it("returns error when at MAX_PROFILES cap (10)", async () => {
    const existing: Profile[] = Array.from({ length: 10 }, (_, i) => ({
      id: `id-${i}`,
      name: `profile-${i}`,
      endpoint: "http://localhost:4566",
      region: "us-east-1",
    }));
    const store = makeCookieStore(serializeProfiles(existing));
    vi.mocked(cookies).mockResolvedValue(store as unknown as CookieStore);

    const result = await createProfileAction(
      idle,
      buildFormData({ name: "new-profile", endpoint: "http://localhost:4566", region: "us-east-1" }),
    );

    expect(result.status).toBe("error");
  });

  it("does NOT call revalidatePath on validation error", async () => {
    const store = makeCookieStore(undefined);
    vi.mocked(cookies).mockResolvedValue(store as unknown as CookieStore);

    await createProfileAction(idle, buildFormData({ ...validInput, name: "" }));

    expect(revalidatePath).not.toHaveBeenCalled();
  });
});

describe("createProfileAction — cookie secure flag", () => {
  it("sets secure: true on cookie when NODE_ENV is production", async () => {
    const store = makeCookieStore(undefined);
    vi.mocked(cookies).mockResolvedValue(store as unknown as CookieStore);
    const original = process.env.NODE_ENV;

    try {
      // @ts-expect-error — overriding read-only env for test
      process.env.NODE_ENV = "production";
      await createProfileAction(idle, buildFormData(validInput));
      expect(store.set).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
        expect.objectContaining({ secure: true }),
      );
    } finally {
      // @ts-expect-error — restoring env
      process.env.NODE_ENV = original;
    }
  });
});
