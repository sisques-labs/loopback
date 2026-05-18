import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("next/headers", () => ({
  cookies: vi.fn(),
}));

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { updateProfileAction } from "./update-profile";
import type { ActionState } from "@/features/shared/types/action-state";
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

const idle: ActionState = { status: "idle" };

beforeEach(() => {
  vi.clearAllMocks();
});

describe("updateProfileAction — success", () => {
  it("returns success when updating an existing profile", async () => {
    const store = makeCookieStore([profileDev, profileStaging]);
    vi.mocked(cookies).mockResolvedValue(store as CookieStore);

    const result = await updateProfileAction(idle, {
      id: "dev-id",
      name: "dev-updated",
      endpoint: "http://localhost:9000",
      region: "us-west-2",
    });

    expect(result.status).toBe("success");
  });

  it("updates the profile fields in the cookie", async () => {
    const store = makeCookieStore([profileDev, profileStaging]);
    vi.mocked(cookies).mockResolvedValue(store as CookieStore);

    await updateProfileAction(idle, {
      id: "dev-id",
      name: "dev-updated",
      endpoint: "http://localhost:9000",
      region: "us-west-2",
    });

    const savedValue = (store.set as ReturnType<typeof vi.fn>).mock.calls[0][1] as string;
    const saved: Profile[] = JSON.parse(savedValue);
    const updatedDev = saved.find((p) => p.id === "dev-id");
    expect(updatedDev?.name).toBe("dev-updated");
    expect(updatedDev?.endpoint).toBe("http://localhost:9000");
    expect(updatedDev?.region).toBe("us-west-2");
  });

  it("preserves other profiles unchanged", async () => {
    const store = makeCookieStore([profileDev, profileStaging]);
    vi.mocked(cookies).mockResolvedValue(store as CookieStore);

    await updateProfileAction(idle, {
      id: "dev-id",
      name: "dev-updated",
      endpoint: "http://localhost:9000",
      region: "us-west-2",
    });

    const savedValue = (store.set as ReturnType<typeof vi.fn>).mock.calls[0][1] as string;
    const saved: Profile[] = JSON.parse(savedValue);
    const stagingProfile = saved.find((p) => p.id === "staging-id");
    expect(stagingProfile).toEqual(profileStaging);
  });

  it("calls revalidatePath on success", async () => {
    const store = makeCookieStore([profileDev]);
    vi.mocked(cookies).mockResolvedValue(store as CookieStore);

    await updateProfileAction(idle, {
      id: "dev-id",
      name: "dev-renamed",
      endpoint: "http://localhost:4566",
      region: "us-east-1",
    });

    expect(revalidatePath).toHaveBeenCalledWith("/", "layout");
  });

  it("allows renaming a profile to its own current name (no self-conflict)", async () => {
    const store = makeCookieStore([profileDev]);
    vi.mocked(cookies).mockResolvedValue(store as CookieStore);

    const result = await updateProfileAction(idle, {
      id: "dev-id",
      name: "dev",
      endpoint: "http://localhost:9000",
      region: "us-west-2",
    });

    expect(result.status).toBe("success");
  });
});

describe("updateProfileAction — validation errors", () => {
  it("returns error for non-existent profile ID", async () => {
    const store = makeCookieStore([profileDev]);
    vi.mocked(cookies).mockResolvedValue(store as CookieStore);

    const result = await updateProfileAction(idle, {
      id: "nonexistent-id",
      name: "new-name",
      endpoint: "http://localhost:4566",
      region: "us-east-1",
    });

    expect(result.status).toBe("error");
  });

  it("does NOT modify cookie for non-existent profile", async () => {
    const store = makeCookieStore([profileDev]);
    vi.mocked(cookies).mockResolvedValue(store as CookieStore);

    await updateProfileAction(idle, {
      id: "nonexistent-id",
      name: "new-name",
      endpoint: "http://localhost:4566",
      region: "us-east-1",
    });

    expect(store.set).not.toHaveBeenCalled();
  });

  it("returns error when new name conflicts with another existing profile", async () => {
    const store = makeCookieStore([profileDev, profileStaging]);
    vi.mocked(cookies).mockResolvedValue(store as CookieStore);

    const result = await updateProfileAction(idle, {
      id: "dev-id",
      name: "staging", // conflicts with profileStaging
      endpoint: "http://localhost:4566",
      region: "us-east-1",
    });

    expect(result.status).toBe("error");
  });

  it("returns error for invalid endpoint URL", async () => {
    const store = makeCookieStore([profileDev]);
    vi.mocked(cookies).mockResolvedValue(store as CookieStore);

    const result = await updateProfileAction(idle, {
      id: "dev-id",
      name: "dev",
      endpoint: "not-a-url",
      region: "us-east-1",
    });

    expect(result.status).toBe("error");
  });

  it("returns error for invalid region", async () => {
    const store = makeCookieStore([profileDev]);
    vi.mocked(cookies).mockResolvedValue(store as CookieStore);

    const result = await updateProfileAction(idle, {
      id: "dev-id",
      name: "dev",
      endpoint: "http://localhost:4566",
      region: "xx-invalid-1",
    });

    expect(result.status).toBe("error");
  });

  it("does NOT call revalidatePath on validation error", async () => {
    const store = makeCookieStore([profileDev]);
    vi.mocked(cookies).mockResolvedValue(store as CookieStore);

    await updateProfileAction(idle, {
      id: "nonexistent-id",
      name: "new-name",
      endpoint: "http://localhost:4566",
      region: "us-east-1",
    });

    expect(revalidatePath).not.toHaveBeenCalled();
  });
});
