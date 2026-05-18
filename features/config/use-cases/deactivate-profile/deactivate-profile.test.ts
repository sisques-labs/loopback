import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("next/headers", () => ({
  cookies: vi.fn(),
}));

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { deactivateProfileAction } from "./deactivate-profile";
import { serializeProfiles } from "@/lib/aws/profiles";
import type { Profile } from "@/lib/aws/profiles";

type CookieStore = Awaited<ReturnType<typeof cookies>>;

const profileDev: Profile = {
  id: "dev-id",
  name: "dev",
  endpoint: "http://localhost:4566",
  region: "us-east-1",
};

function makeCookieStore(profiles: Profile[], activeProfileId?: string) {
  return {
    get: vi.fn((name: string) => {
      if (name === "aws-profiles") {
        return { value: serializeProfiles(profiles) };
      }
      if (name === "aws-active-profile") {
        return activeProfileId ? { value: activeProfileId } : undefined;
      }
      return undefined;
    }),
    set: vi.fn(),
    delete: vi.fn(),
  };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("deactivateProfileAction — success", () => {
  it("returns success when a profile is active", async () => {
    const store = makeCookieStore([profileDev], "dev-id");
    vi.mocked(cookies).mockResolvedValue(store as CookieStore);

    const result = await deactivateProfileAction();

    expect(result.status).toBe("success");
  });

  it("deletes the aws-active-profile cookie", async () => {
    const store = makeCookieStore([profileDev], "dev-id");
    vi.mocked(cookies).mockResolvedValue(store as CookieStore);

    await deactivateProfileAction();

    expect(store.delete).toHaveBeenCalledWith("aws-active-profile");
  });

  it("calls revalidatePath on success", async () => {
    const store = makeCookieStore([profileDev], "dev-id");
    vi.mocked(cookies).mockResolvedValue(store as CookieStore);

    await deactivateProfileAction();

    expect(revalidatePath).toHaveBeenCalledWith("/", "layout");
  });

  it("succeeds even when no profile was active", async () => {
    const store = makeCookieStore([profileDev]);
    vi.mocked(cookies).mockResolvedValue(store as CookieStore);

    const result = await deactivateProfileAction();

    expect(result.status).toBe("success");
  });

  it("still deletes the cookie even when no profile was active", async () => {
    const store = makeCookieStore([profileDev]);
    vi.mocked(cookies).mockResolvedValue(store as CookieStore);

    await deactivateProfileAction();

    expect(store.delete).toHaveBeenCalledWith("aws-active-profile");
  });

  it("calls revalidatePath even when no profile was active", async () => {
    const store = makeCookieStore([]);
    vi.mocked(cookies).mockResolvedValue(store as CookieStore);

    await deactivateProfileAction();

    expect(revalidatePath).toHaveBeenCalledWith("/", "layout");
  });
});
