import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("next/headers", () => ({
  cookies: vi.fn(),
}));

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { updateRegionAction } from "./update-region";
import type { ActionState } from "@/features/shared/types/action-state";

type CookieStore = Awaited<ReturnType<typeof cookies>>;

function makeCookieStore() {
  return {
    get: vi.fn(),
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

beforeEach(() => {
  vi.clearAllMocks();
});

describe("updateRegionAction — valid region", () => {
  it("returns success for a valid region", async () => {
    const store = makeCookieStore();
    vi.mocked(cookies).mockResolvedValue(store as unknown as CookieStore);

    const result = await updateRegionAction(idle, buildFormData({ region: "us-east-1" }));

    expect(result.status).toBe("success");
  });

  it("sets aws-region-override cookie with the given region value", async () => {
    const store = makeCookieStore();
    vi.mocked(cookies).mockResolvedValue(store as unknown as CookieStore);

    await updateRegionAction(idle, buildFormData({ region: "us-west-2" }));

    expect(store.set).toHaveBeenCalledWith("aws-region-override", "us-west-2", {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
    });
  });

  it("calls revalidatePath on success", async () => {
    const store = makeCookieStore();
    vi.mocked(cookies).mockResolvedValue(store as unknown as CookieStore);

    await updateRegionAction(idle, buildFormData({ region: "eu-west-1" }));

    expect(revalidatePath).toHaveBeenCalledWith("/", "layout");
  });

  it("accepts all valid AWS_REGIONS values", async () => {
    const store = makeCookieStore();
    vi.mocked(cookies).mockResolvedValue(store as unknown as CookieStore);

    const result = await updateRegionAction(idle, buildFormData({ region: "ap-northeast-1" }));

    expect(result.status).toBe("success");
  });
});

describe("updateRegionAction — validation errors", () => {
  it("returns error for an empty string", async () => {
    const store = makeCookieStore();
    vi.mocked(cookies).mockResolvedValue(store as unknown as CookieStore);

    const result = await updateRegionAction(idle, buildFormData({ region: "" }));

    expect(result.status).toBe("error");
  });

  it("returns error for an unknown region code", async () => {
    const store = makeCookieStore();
    vi.mocked(cookies).mockResolvedValue(store as unknown as CookieStore);

    const result = await updateRegionAction(idle, buildFormData({ region: "xx-invalid-1" }));

    expect(result.status).toBe("error");
  });

  it("does NOT set cookie on validation error", async () => {
    const store = makeCookieStore();
    vi.mocked(cookies).mockResolvedValue(store as unknown as CookieStore);

    await updateRegionAction(idle, buildFormData({ region: "" }));

    expect(store.set).not.toHaveBeenCalled();
  });

  it("does NOT call revalidatePath on validation error", async () => {
    const store = makeCookieStore();
    vi.mocked(cookies).mockResolvedValue(store as unknown as CookieStore);

    await updateRegionAction(idle, buildFormData({ region: "" }));

    expect(revalidatePath).not.toHaveBeenCalled();
  });
});
