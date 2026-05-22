import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("next/headers", () => ({
  cookies: vi.fn(),
}));

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { updateEndpointAction } from "./update-endpoint";
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

describe("updateEndpointAction — validation errors", () => {
  it("returns error for a non-URL string", async () => {
    const store = makeCookieStore();
    vi.mocked(cookies).mockResolvedValue(store as unknown as CookieStore);

    const result = await updateEndpointAction(idle, buildFormData({ endpoint: "not-a-url" }));

    expect(result.status).toBe("error");
  });

  it("returns error for a relative path", async () => {
    const store = makeCookieStore();
    vi.mocked(cookies).mockResolvedValue(store as unknown as CookieStore);

    const result = await updateEndpointAction(idle, buildFormData({ endpoint: "/local" }));

    expect(result.status).toBe("error");
  });

  it("does NOT call revalidatePath on validation error", async () => {
    const store = makeCookieStore();
    vi.mocked(cookies).mockResolvedValue(store as unknown as CookieStore);

    await updateEndpointAction(idle, buildFormData({ endpoint: "not-a-url" }));

    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it("does NOT set cookie on validation error", async () => {
    const store = makeCookieStore();
    vi.mocked(cookies).mockResolvedValue(store as unknown as CookieStore);

    await updateEndpointAction(idle, buildFormData({ endpoint: "not-a-url" }));

    expect(store.set).not.toHaveBeenCalled();
  });
});

describe("updateEndpointAction — valid URL", () => {
  it("returns success for a valid http URL", async () => {
    const store = makeCookieStore();
    vi.mocked(cookies).mockResolvedValue(store as unknown as CookieStore);

    const result = await updateEndpointAction(
      idle,
      buildFormData({ endpoint: "http://localhost:4566" }),
    );

    expect(result.status).toBe("success");
  });

  it("sets cookie with httpOnly: true for a valid URL", async () => {
    const store = makeCookieStore();
    vi.mocked(cookies).mockResolvedValue(store as unknown as CookieStore);

    await updateEndpointAction(idle, buildFormData({ endpoint: "http://localhost:4566" }));

    expect(store.set).toHaveBeenCalledWith(
      expect.any(String),
      "http://localhost:4566/",
      expect.objectContaining({ httpOnly: true }),
    );
  });

  it("calls revalidatePath on success", async () => {
    const store = makeCookieStore();
    vi.mocked(cookies).mockResolvedValue(store as unknown as CookieStore);

    await updateEndpointAction(idle, buildFormData({ endpoint: "http://localhost:4566" }));

    expect(revalidatePath).toHaveBeenCalledWith("/", "layout");
  });
});

describe("updateEndpointAction — clear flow (empty string)", () => {
  it("returns success when endpoint is empty string", async () => {
    const store = makeCookieStore();
    vi.mocked(cookies).mockResolvedValue(store as unknown as CookieStore);

    const result = await updateEndpointAction(idle, buildFormData({ endpoint: "" }));

    expect(result.status).toBe("success");
  });

  it("deletes cookie when endpoint is empty string", async () => {
    const store = makeCookieStore();
    vi.mocked(cookies).mockResolvedValue(store as unknown as CookieStore);

    await updateEndpointAction(idle, buildFormData({ endpoint: "" }));

    expect(store.delete).toHaveBeenCalled();
    expect(store.set).not.toHaveBeenCalled();
  });

  it("calls revalidatePath when endpoint is cleared", async () => {
    const store = makeCookieStore();
    vi.mocked(cookies).mockResolvedValue(store as unknown as CookieStore);

    await updateEndpointAction(idle, buildFormData({ endpoint: "" }));

    expect(revalidatePath).toHaveBeenCalledWith("/", "layout");
  });
});

describe("updateEndpointAction — cookie secure flag", () => {
  it("uses COOKIE_OPTIONS (includes secure flag) when setting the cookie", async () => {
    const store = makeCookieStore();
    vi.mocked(cookies).mockResolvedValue(store as unknown as CookieStore);

    await updateEndpointAction(idle, buildFormData({ endpoint: "http://localhost:4566" }));

    // COOKIE_OPTIONS.secure is false in test env (NODE_ENV=test), true in production.
    // This assertion verifies the action uses the centralized COOKIE_OPTIONS, not an
    // inline literal. The secure flag's value itself is validated in lib/aws/config.test.ts.
    expect(store.set).toHaveBeenCalledWith(
      expect.any(String),
      expect.any(String),
      expect.objectContaining({ secure: process.env.NODE_ENV === "production" }),
    );
  });
});
