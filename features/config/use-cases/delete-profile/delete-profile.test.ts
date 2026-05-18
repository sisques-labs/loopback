import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("next/headers", () => ({
  cookies: vi.fn(),
}));

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { deleteProfileAction } from "./delete-profile";
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

describe("deleteProfileAction — success (inactive profile)", () => {
  it("returns success when deleting an inactive profile", async () => {
    const store = makeCookieStore([profileDev, profileStaging]);
    vi.mocked(cookies).mockResolvedValue(store as CookieStore);

    const result = await deleteProfileAction("dev-id");

    expect(result.status).toBe("success");
  });

  it("removes the profile from the cookie", async () => {
    const store = makeCookieStore([profileDev, profileStaging]);
    vi.mocked(cookies).mockResolvedValue(store as CookieStore);

    await deleteProfileAction("dev-id");

    const savedValue = (store.set as ReturnType<typeof vi.fn>).mock.calls[0][1] as string;
    const saved: Profile[] = JSON.parse(savedValue);
    expect(saved.find((p) => p.id === "dev-id")).toBeUndefined();
  });

  it("preserves remaining profiles", async () => {
    const store = makeCookieStore([profileDev, profileStaging]);
    vi.mocked(cookies).mockResolvedValue(store as CookieStore);

    await deleteProfileAction("dev-id");

    const savedValue = (store.set as ReturnType<typeof vi.fn>).mock.calls[0][1] as string;
    const saved: Profile[] = JSON.parse(savedValue);
    expect(saved).toHaveLength(1);
    expect(saved[0]).toEqual(profileStaging);
  });

  it("does NOT touch aws-active-profile cookie when deleted profile is not active", async () => {
    const store = makeCookieStore([profileDev, profileStaging], "staging-id");
    vi.mocked(cookies).mockResolvedValue(store as CookieStore);

    await deleteProfileAction("dev-id");

    expect(store.delete).not.toHaveBeenCalledWith("aws-active-profile");
  });

  it("calls revalidatePath on success", async () => {
    const store = makeCookieStore([profileDev]);
    vi.mocked(cookies).mockResolvedValue(store as CookieStore);

    await deleteProfileAction("dev-id");

    expect(revalidatePath).toHaveBeenCalledWith("/", "layout");
  });
});

describe("deleteProfileAction — active profile protection", () => {
  it("returns error when trying to delete the active profile", async () => {
    const store = makeCookieStore([profileDev, profileStaging], "dev-id");
    vi.mocked(cookies).mockResolvedValue(store as CookieStore);

    const result = await deleteProfileAction("dev-id");

    expect(result.status).toBe("error");
  });

  it("does NOT delete when profile is active", async () => {
    const store = makeCookieStore([profileDev, profileStaging], "dev-id");
    vi.mocked(cookies).mockResolvedValue(store as CookieStore);

    await deleteProfileAction("dev-id");

    expect(store.set).not.toHaveBeenCalled();
  });

  it("does NOT call revalidatePath when profile is active", async () => {
    const store = makeCookieStore([profileDev], "dev-id");
    vi.mocked(cookies).mockResolvedValue(store as CookieStore);

    await deleteProfileAction("dev-id");

    expect(revalidatePath).not.toHaveBeenCalled();
  });
});

describe("deleteProfileAction — error cases", () => {
  it("returns error for non-existent profile ID", async () => {
    const store = makeCookieStore([profileDev]);
    vi.mocked(cookies).mockResolvedValue(store as CookieStore);

    const result = await deleteProfileAction("nonexistent-id");

    expect(result.status).toBe("error");
  });

  it("does NOT modify cookie for non-existent profile", async () => {
    const store = makeCookieStore([profileDev]);
    vi.mocked(cookies).mockResolvedValue(store as CookieStore);

    await deleteProfileAction("nonexistent-id");

    expect(store.set).not.toHaveBeenCalled();
  });
});
