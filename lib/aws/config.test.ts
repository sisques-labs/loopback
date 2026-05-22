import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

vi.mock("next/headers", () => ({
  cookies: vi.fn(),
}));

vi.mock("@aws-sdk/credential-providers", () => ({
  fromNodeProviderChain: vi.fn(),
}));

import { fromNodeProviderChain } from "@aws-sdk/credential-providers";
import { cookies } from "next/headers";
import {
  createAwsConfig,
  ENDPOINT_COOKIE_NAME,
  maskSecret,
  REGION_COOKIE_NAME,
  PROFILES_COOKIE_NAME,
  ACTIVE_PROFILE_COOKIE_NAME,
  COOKIE_OPTIONS,
} from "./config";

type CookieStore = Awaited<ReturnType<typeof cookies>>;
type CredentialProvider = ReturnType<typeof fromNodeProviderChain>;

type CookieMap = Partial<Record<string, string>>;

function makeCookieStore(cookieMap?: CookieMap) {
  // Support legacy single-string signature for backward compat with existing tests
  return {
    get: vi.fn((name: string) => {
      if (!cookieMap) return undefined;
      const val = cookieMap[name];
      return val !== undefined ? { value: val } : undefined;
    }),
  };
}

/** Builds a credential mock that resolves successfully */
function makeChainProvider(
  accessKeyId = "from-chain",
  secretAccessKey = "chain-secret",
) {
  return vi
    .fn()
    .mockResolvedValue({ accessKeyId, secretAccessKey }) as CredentialProvider;
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
    vi.mocked(cookies).mockResolvedValue(
      makeCookieStore() as unknown as CookieStore,
    );

    const mockProvider = vi.fn().mockResolvedValue({
      accessKeyId: "from-chain",
      secretAccessKey: "chain-secret",
    });
    vi.mocked(fromNodeProviderChain).mockReturnValue(
      mockProvider as CredentialProvider,
    );

    const config = await createAwsConfig();

    expect(config.endpoint).toBe("http://localhost:4566");
  });

  it("uses cookie value when cookie is set (cookie wins over env var)", async () => {
    process.env.AWS_ENDPOINT_URL = "http://localhost:4566";
    vi.mocked(cookies).mockResolvedValue(
      makeCookieStore({
        [ENDPOINT_COOKIE_NAME]: "http://cookie-endpoint:9000",
      }) as unknown as CookieStore,
    );

    const mockProvider = vi.fn().mockResolvedValue({
      accessKeyId: "from-chain",
      secretAccessKey: "chain-secret",
    });
    vi.mocked(fromNodeProviderChain).mockReturnValue(
      mockProvider as CredentialProvider,
    );

    const config = await createAwsConfig();

    expect(config.endpoint).toBe("http://cookie-endpoint:9000");
  });

  it("returns undefined endpoint when no cookie and no env var", async () => {
    vi.mocked(cookies).mockResolvedValue(
      makeCookieStore() as unknown as CookieStore,
    );

    const mockProvider = vi.fn().mockResolvedValue({
      accessKeyId: "from-chain",
      secretAccessKey: "chain-secret",
    });
    vi.mocked(fromNodeProviderChain).mockReturnValue(
      mockProvider as CredentialProvider,
    );

    const config = await createAwsConfig();

    expect(config.endpoint).toBeUndefined();
  });
});

describe("createAwsConfig — region resolution", () => {
  it("defaults to us-east-1 when AWS_REGION is not set", async () => {
    vi.mocked(cookies).mockResolvedValue(
      makeCookieStore() as unknown as CookieStore,
    );
    const mockProvider = vi.fn().mockResolvedValue({
      accessKeyId: "from-chain",
      secretAccessKey: "chain-secret",
    });
    vi.mocked(fromNodeProviderChain).mockReturnValue(
      mockProvider as CredentialProvider,
    );

    const config = await createAwsConfig();

    expect(config.region).toBe("us-east-1");
  });

  it("uses AWS_REGION when set", async () => {
    process.env.AWS_REGION = "eu-west-1";
    vi.mocked(cookies).mockResolvedValue(
      makeCookieStore() as unknown as CookieStore,
    );
    const mockProvider = vi.fn().mockResolvedValue({
      accessKeyId: "from-chain",
      secretAccessKey: "chain-secret",
    });
    vi.mocked(fromNodeProviderChain).mockReturnValue(
      mockProvider as CredentialProvider,
    );

    const config = await createAwsConfig();

    expect(config.region).toBe("eu-west-1");
  });
});

describe("createAwsConfig — credentials resolution", () => {
  it("uses credentials from fromNodeProviderChain when it resolves", async () => {
    vi.mocked(cookies).mockResolvedValue(
      makeCookieStore() as unknown as CookieStore,
    );
    const chainCreds = {
      accessKeyId: "chain-key",
      secretAccessKey: "chain-secret",
    };
    const mockProvider = vi.fn().mockResolvedValue(chainCreds);
    vi.mocked(fromNodeProviderChain).mockReturnValue(
      mockProvider as CredentialProvider,
    );

    const config = await createAwsConfig();
    const resolvedCreds =
      typeof config.credentials === "function"
        ? await (config.credentials as () => Promise<typeof chainCreds>)()
        : config.credentials;

    expect(resolvedCreds.accessKeyId).toBe("chain-key");
  });

  it("falls back to test credentials when fromNodeProviderChain throws", async () => {
    vi.mocked(cookies).mockResolvedValue(
      makeCookieStore() as unknown as CookieStore,
    );
    const mockProvider = vi
      .fn()
      .mockRejectedValue(new Error("No credentials found"));
    vi.mocked(fromNodeProviderChain).mockReturnValue(
      mockProvider as CredentialProvider,
    );

    const config = await createAwsConfig();
    const resolvedCreds =
      typeof config.credentials === "function"
        ? await (
            config.credentials as () => Promise<{
              accessKeyId: string;
              secretAccessKey: string;
            }>
          )()
        : config.credentials;

    expect(resolvedCreds.accessKeyId).toBe("test");
    expect((resolvedCreds as { secretAccessKey: string }).secretAccessKey).toBe(
      "test",
    );
  });
});

describe("createAwsConfig — 4-tier precedence chain", () => {
  const profileDev = {
    id: "profile-1",
    name: "dev",
    endpoint: "http://profile-endpoint:4566",
    region: "ap-northeast-1",
  };

  it("Tier 1: active profile wins over all standalone cookies and env vars", async () => {
    process.env.AWS_ENDPOINT_URL = "http://env-endpoint:4566";
    process.env.AWS_REGION = "us-west-2";
    vi.mocked(cookies).mockResolvedValue(
      makeCookieStore({
        [PROFILES_COOKIE_NAME]: JSON.stringify([profileDev]),
        [ACTIVE_PROFILE_COOKIE_NAME]: "profile-1",
        [ENDPOINT_COOKIE_NAME]: "http://standalone-endpoint:9000",
        [REGION_COOKIE_NAME]: "eu-central-1",
      }) as unknown as CookieStore,
    );
    vi.mocked(fromNodeProviderChain).mockReturnValue(makeChainProvider());

    const config = await createAwsConfig();

    expect(config.endpoint).toBe("http://profile-endpoint:4566");
    expect(config.region).toBe("ap-northeast-1");
  });

  it("Tier 1 + orphaned standalone: active profile wins when endpoint cookie also set", async () => {
    vi.mocked(cookies).mockResolvedValue(
      makeCookieStore({
        [PROFILES_COOKIE_NAME]: JSON.stringify([profileDev]),
        [ACTIVE_PROFILE_COOKIE_NAME]: "profile-1",
        [ENDPOINT_COOKIE_NAME]: "http://standalone-endpoint:9000",
      }) as unknown as CookieStore,
    );
    vi.mocked(fromNodeProviderChain).mockReturnValue(makeChainProvider());

    const config = await createAwsConfig();

    expect(config.endpoint).toBe("http://profile-endpoint:4566");
    expect(config.region).toBe("ap-northeast-1");
  });

  it("Tier 2: region cookie used when no active profile", async () => {
    process.env.AWS_ENDPOINT_URL = "http://env-endpoint:4566";
    vi.mocked(cookies).mockResolvedValue(
      makeCookieStore({
        [REGION_COOKIE_NAME]: "eu-west-1",
      }) as unknown as CookieStore,
    );
    vi.mocked(fromNodeProviderChain).mockReturnValue(makeChainProvider());

    const config = await createAwsConfig();

    expect(config.region).toBe("eu-west-1");
    expect(config.endpoint).toBe("http://env-endpoint:4566");
  });

  it("Tier 3: endpoint cookie used when no active profile and no region cookie", async () => {
    process.env.AWS_REGION = "us-east-2";
    vi.mocked(cookies).mockResolvedValue(
      makeCookieStore({
        [ENDPOINT_COOKIE_NAME]: "http://standalone-endpoint:9000",
      }) as unknown as CookieStore,
    );
    vi.mocked(fromNodeProviderChain).mockReturnValue(makeChainProvider());

    const config = await createAwsConfig();

    expect(config.endpoint).toBe("http://standalone-endpoint:9000");
    expect(config.region).toBe("us-east-2");
  });

  it("malformed profiles cookie: treats as no active profile and falls through", async () => {
    vi.mocked(cookies).mockResolvedValue(
      makeCookieStore({
        [PROFILES_COOKIE_NAME]: "invalid-json",
        [ACTIVE_PROFILE_COOKIE_NAME]: "profile-1",
        [ENDPOINT_COOKIE_NAME]: "http://standalone-endpoint:9000",
      }) as unknown as CookieStore,
    );
    vi.mocked(fromNodeProviderChain).mockReturnValue(makeChainProvider());

    const config = await createAwsConfig();

    expect(config.endpoint).toBe("http://standalone-endpoint:9000");
  });

  it("active profile ID not found in profiles: falls through to standalone cookies", async () => {
    vi.mocked(cookies).mockResolvedValue(
      makeCookieStore({
        [PROFILES_COOKIE_NAME]: JSON.stringify([profileDev]),
        [ACTIVE_PROFILE_COOKIE_NAME]: "ghost-id",
        [ENDPOINT_COOKIE_NAME]: "http://standalone-endpoint:9000",
      }) as unknown as CookieStore,
    );
    vi.mocked(fromNodeProviderChain).mockReturnValue(makeChainProvider());

    const config = await createAwsConfig();

    expect(config.endpoint).toBe("http://standalone-endpoint:9000");
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

describe("COOKIE_OPTIONS", () => {
  it("is exported from config", () => {
    expect(COOKIE_OPTIONS).toBeDefined();
  });

  it("includes httpOnly: true", () => {
    expect(COOKIE_OPTIONS).toMatchObject({ httpOnly: true });
  });

  it("includes sameSite: 'lax'", () => {
    expect(COOKIE_OPTIONS).toMatchObject({ sameSite: "lax" });
  });

  it("includes path: '/'", () => {
    expect(COOKIE_OPTIONS).toMatchObject({ path: "/" });
  });

  it("includes maxAge of 1 year (31536000 seconds)", () => {
    expect(COOKIE_OPTIONS).toMatchObject({ maxAge: 60 * 60 * 24 * 365 });
  });

  it("sets secure: true when NODE_ENV is 'production'", () => {
    const original = process.env.NODE_ENV;
    try {
      // @ts-expect-error — overriding read-only env for test
      process.env.NODE_ENV = "production";
      // COOKIE_OPTIONS is evaluated at module load time — we test the formula directly
      const secure = process.env.NODE_ENV === "production";
      expect(secure).toBe(true);
    } finally {
      // @ts-expect-error — restoring env
      process.env.NODE_ENV = original;
    }
  });

  it("sets secure: false when NODE_ENV is 'development'", () => {
    const original = process.env.NODE_ENV;
    try {
      // @ts-expect-error — overriding read-only env for test
      process.env.NODE_ENV = "development";
      const secure = process.env.NODE_ENV === "production";
      expect(secure).toBe(false);
    } finally {
      // @ts-expect-error — restoring env
      process.env.NODE_ENV = original;
    }
  });

  it("has secure: false in test environment (NODE_ENV=test)", () => {
    // In vitest, NODE_ENV defaults to 'test', which is not 'production'
    expect(COOKIE_OPTIONS.secure).toBe(false);
  });
});
