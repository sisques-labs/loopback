import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { resolveCredentialSource } from "./credential-source";

describe("resolveCredentialSource", () => {
  afterEach(() => {
    delete process.env.AWS_PROFILE;
    delete process.env.AWS_ACCESS_KEY_ID;
  });

  it("returns 'profile' when AWS_PROFILE is set", () => {
    process.env.AWS_PROFILE = "my-profile";
    expect(resolveCredentialSource()).toBe("profile");
  });

  it("returns 'env' when AWS_ACCESS_KEY_ID is set and no profile", () => {
    process.env.AWS_ACCESS_KEY_ID = "AKIAIOSFODNN7EXAMPLE";
    expect(resolveCredentialSource()).toBe("env");
  });

  it("returns 'fallback' when neither AWS_PROFILE nor AWS_ACCESS_KEY_ID is set", () => {
    expect(resolveCredentialSource()).toBe("fallback");
  });
});
