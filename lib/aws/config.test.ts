import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

vi.mock("server-only", () => ({}));

vi.mock("next/headers", () => ({
  cookies: vi.fn(),
}));

vi.mock("@aws-sdk/credential-providers", () => ({
  fromNodeProviderChain: vi.fn(),
}));

import { cookies } from "next/headers";
import { fromNodeProviderChain } from "@aws-sdk/credential-providers";
import { createAwsConfig, maskSecret, ENDPOINT_COOKIE_NAME } from "./config";

function makeCookieStore(cookieValue?: string) {
  return {
    get: vi.fn((name: string) => {
      if (name === ENDPOINT_COOKIE_NAME && cookieValue !== undefined) {
        return { value: cookieValue };
      }
      return undefined;
    }),
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  delete process.env.AWS_ENDPOINT_URL;
  delete process.env.AWS_REGION;
});

afterEach(() => {
  delete process.env.AWS_ENDPOINT_URL;
  delete process.env.AWS_REGION;
});

describe("createAwsConfig — endpoint resolution", () => {
  it("uses AWS_ENDPOINT_URL when no cookie is set", async () => {
    process.env.AWS_ENDPOINT_URL = "http://localhost:4566";
    vi.mocked(cookies).mockResolvedValue(makeCookieStore() as any);

    const mockProvider = vi.fn().mockResolvedValue({ accessKeyId: "from-chain", secretAccessKey: "chain-secret" });
    vi.mocked(fromNodeProviderChain).mockReturnValue(mockProvider as any);

    const config = await createAwsConfig();

    expect(config.endpoint).toBe("http://localhost:4566");
  });

  it("uses cookie value when cookie is set (cookie wins over env var)", async () => {
    process.env.AWS_ENDPOINT_URL = "http://localhost:4566";
    vi.mocked(cookies).mockResolvedValue(makeCookieStore("http://cookie-endpoint:9000") as any);

    const mockProvider = vi.fn().mockResolvedValue({ accessKeyId: "from-chain", secretAccessKey: "chain-secret" });
    vi.mocked(fromNodeProviderChain).mockReturnValue(mockProvider as any);

    const config = await createAwsConfig();

    expect(config.endpoint).toBe("http://cookie-endpoint:9000");
  });

  it("returns undefined endpoint when no cookie and no env var", async () => {
    vi.mocked(cookies).mockResolvedValue(makeCookieStore() as any);

    const mockProvider = vi.fn().mockResolvedValue({ accessKeyId: "from-chain", secretAccessKey: "chain-secret" });
    vi.mocked(fromNodeProviderChain).mockReturnValue(mockProvider as any);

    const config = await createAwsConfig();

    expect(config.endpoint).toBeUndefined();
  });
});

describe("createAwsConfig — region resolution", () => {
  it("defaults to us-east-1 when AWS_REGION is not set", async () => {
    vi.mocked(cookies).mockResolvedValue(makeCookieStore() as any);
    const mockProvider = vi.fn().mockResolvedValue({ accessKeyId: "from-chain", secretAccessKey: "chain-secret" });
    vi.mocked(fromNodeProviderChain).mockReturnValue(mockProvider as any);

    const config = await createAwsConfig();

    expect(config.region).toBe("us-east-1");
  });

  it("uses AWS_REGION when set", async () => {
    process.env.AWS_REGION = "eu-west-1";
    vi.mocked(cookies).mockResolvedValue(makeCookieStore() as any);
    const mockProvider = vi.fn().mockResolvedValue({ accessKeyId: "from-chain", secretAccessKey: "chain-secret" });
    vi.mocked(fromNodeProviderChain).mockReturnValue(mockProvider as any);

    const config = await createAwsConfig();

    expect(config.region).toBe("eu-west-1");
  });
});

describe("createAwsConfig — credentials resolution", () => {
  it("uses credentials from fromNodeProviderChain when it resolves", async () => {
    vi.mocked(cookies).mockResolvedValue(makeCookieStore() as any);
    const chainCreds = { accessKeyId: "chain-key", secretAccessKey: "chain-secret" };
    const mockProvider = vi.fn().mockResolvedValue(chainCreds);
    vi.mocked(fromNodeProviderChain).mockReturnValue(mockProvider as any);

    const config = await createAwsConfig();
    const resolvedCreds = typeof config.credentials === "function"
      ? await (config.credentials as () => Promise<typeof chainCreds>)()
      : config.credentials;

    expect(resolvedCreds.accessKeyId).toBe("chain-key");
  });

  it("falls back to test credentials when fromNodeProviderChain throws", async () => {
    vi.mocked(cookies).mockResolvedValue(makeCookieStore() as any);
    const mockProvider = vi.fn().mockRejectedValue(new Error("No credentials found"));
    vi.mocked(fromNodeProviderChain).mockReturnValue(mockProvider as any);

    const config = await createAwsConfig();
    const resolvedCreds = typeof config.credentials === "function"
      ? await (config.credentials as () => Promise<{ accessKeyId: string; secretAccessKey: string }>)()
      : config.credentials;

    expect(resolvedCreds.accessKeyId).toBe("test");
    expect((resolvedCreds as { secretAccessKey: string }).secretAccessKey).toBe("test");
  });
});

describe("maskSecret", () => {
  it("masks all but last 4 characters for secrets longer than 4", () => {
    const result = maskSecret("ABCDEFGH");
    expect(result).toBe("••••••••EFGH");
  });

  it("returns full mask for secrets with fewer than 4 characters", () => {
    const result = maskSecret("AB");
    expect(result).toBe("••••••••");
  });

  it("returns full mask for secret with exactly 4 characters", () => {
    const result = maskSecret("ABCD");
    expect(result).toBe("••••••••");
  });
});
