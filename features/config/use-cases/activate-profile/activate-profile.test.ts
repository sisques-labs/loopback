import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("next/headers", () => ({
  cookies: vi.fn(),
}));

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { activateProfileAction } from "./activate-profile";
import { serializeProfiles } from "@/lib/aws/profiles";
import type { Profile } from "@/lib/aws/profiles";

type CookieStore = Awaited<ReturnType<typeof cookies>>;

const profileDev: Profile = {
  id: "dev-id",
  name: "dev",
  endpoint: "http://localhost:4566",
  region: "us-east-1",
};

const profileStaging: Profile = {
  id: "staging-id",
  name: "staging",
  endpoint: "http://staging:4566",
  region: "eu-west-1",
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

describe("activateProfileAction — success", () => {
  it("returns success when activating an existing profile", async () => {
    const store = makeCookieStore([profileDev, profileStaging]);
    vi.mocked(cookies).mockResolvedValue(store as CookieStore);

    const result = await activateProfileAction("dev-id");

    expect(result.status).toBe("success");
  });

  it("sets aws-active-profile cookie to the given profile ID", async () => {
    const store = makeCookieStore([profileDev, profileStaging]);
    vi.mocked(cookies).mockResolvedValue(store as CookieStore);

    await activateProfileAction("dev-id");

    expect(store.set).toHaveBeenCalledWith(
      "aws-active-profile",
      "dev-id",
      expect.objectContaining({ httpOnly: true }),
    );
  });

  it("calls revalidatePath on success", async () => {
    const store = makeCookieStore([profileDev]);
    vi.mocked(cookies).mockResolvedValue(store as CookieStore);

    await activateProfileAction("dev-id");

    expect(revalidatePath).toHaveBeenCalledWith("/", "layout");
  });

  it("can switch from one active profile to another", async () => {
    const store = makeCookieStore([profileDev, profileStaging], "dev-id");
    vi.mocked(cookies).mockResolvedValue(store as CookieStore);

    const result = await activateProfileAction("staging-id");

    expect(result.status).toBe("success");
    expect(store.set).toHaveBeenCalledWith(
      "aws-active-profile",
      "staging-id",
      expect.any(Object),
    );
  });
});

describe("activateProfileAction — error cases", () => {
  it("returns error for non-existent profile ID", async () => {
    const store = makeCookieStore([profileDev]);
    vi.mocked(cookies).mockResolvedValue(store as CookieStore);

    const result = await activateProfileAction("nonexistent-id");

    expect(result.status).toBe("error");
  });

  it("does NOT set cookie for non-existent profile", async () => {
    const store = makeCookieStore([profileDev]);
    vi.mocked(cookies).mockResolvedValue(store as CookieStore);

    await activateProfileAction("nonexistent-id");

    expect(store.set).not.toHaveBeenCalled();
  });

  it("does NOT call revalidatePath for non-existent profile", async () => {
    const store = makeCookieStore([profileDev]);
    vi.mocked(cookies).mockResolvedValue(store as CookieStore);

    await activateProfileAction("nonexistent-id");

    expect(revalidatePath).not.toHaveBeenCalled();
  });
});
