import "server-only";
import { cookies } from "next/headers";
import { fromNodeProviderChain } from "@aws-sdk/credential-providers";
import {
  parseProfilesCookie,
  parseActiveProfileCookie,
} from "./profiles";

export const ENDPOINT_COOKIE_NAME = "aws-endpoint-override";
export const REGION_COOKIE_NAME = "aws-region-override";
export const PROFILES_COOKIE_NAME = "aws-profiles";
export const ACTIVE_PROFILE_COOKIE_NAME = "aws-active-profile";

/**
 * Cookie attributes for all aws-local-ui config cookies.
 *
 * - httpOnly: cookies are server-only; client JS can NEVER read them
 *   (defense-in-depth, even though no credentials are stored — see below)
 * - sameSite: "lax" — permits top-level GET navigation while blocking CSRF on POST
 * - secure: true in production builds — requires HTTPS; localhost dev (HTTP) keeps working
 * - maxAge: 1 year — config persists across sessions; cleared by deletion or expiry
 *
 * SECURITY MODEL:
 * These cookies hold ONLY endpoint URLs, region strings, and profile metadata.
 * AWS credentials are NEVER persisted in cookies. Credentials come from the
 * Node provider chain (env, ~/.aws/credentials, IMDS) or the canonical
 * "test/test" fallback for local AWS-emulator setups.
 */
export const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 60 * 24 * 365,
  secure: process.env.NODE_ENV === "production",
} as const;

export type AwsCredentials = {
  accessKeyId: string;
  secretAccessKey: string;
  sessionToken?: string;
};

export type AwsClientConfig = {
  endpoint: string | undefined;
  region: string;
  credentials: AwsCredentials | (() => Promise<AwsCredentials>);
};

/**
 * Returns a credentials provider that delegates to the node provider chain
 * and falls back to static test credentials if the chain throws.
 *
 * NOTE: The fallback is intentional — this tool targets local dev against
 * a configured AWS endpoint where "test/test" is the canonical default.
 */
function nodeChainWithTestFallback(): () => Promise<AwsCredentials> {
  const chain = fromNodeProviderChain();
  return async () => {
    try {
      const creds = await chain();
      return {
        accessKeyId: creds.accessKeyId,
        secretAccessKey: creds.secretAccessKey,
        sessionToken: creds.sessionToken,
      };
    } catch {
      return { accessKeyId: "test", secretAccessKey: "test" };
    }
  };
}

/** Returns the cookie string value if it is non-empty after trimming, else undefined. */
function cookieString(value: string | undefined): string | undefined {
  return value && value.trim() !== "" ? value : undefined;
}

/**
 * Creates a fresh AWS client config on every call.
 *
 * IMPORTANT: There is intentionally NO module-level cache here.
 * Config is read from httpOnly cookies on each request so that changes
 * made via the Settings UI take effect immediately without a process restart.
 *
 * Precedence (highest wins):
 *   1. Active profile  → endpoint + region
 *   2. `aws-region-override` cookie → region only
 *   3. `aws-endpoint-override` cookie → endpoint only
 *   4. AWS_ENDPOINT_URL / AWS_REGION env vars → defaults
 */
export async function createAwsConfig(): Promise<AwsClientConfig> {
  const store = await cookies();

  const profiles = parseProfilesCookie(
    store.get(PROFILES_COOKIE_NAME)?.value,
  );
  const activeProfile = parseActiveProfileCookie(
    store.get(ACTIVE_PROFILE_COOKIE_NAME)?.value,
    profiles,
  );

  let endpoint: string | undefined;
  let region: string;

  if (activeProfile) {
    // Tier 1: active profile wins — provides both endpoint and region
    endpoint = activeProfile.endpoint;
    region = activeProfile.region;
  } else {
    // Tier 2: region cookie (region only); Tier 4 fallback: env var or default
    region =
      cookieString(store.get(REGION_COOKIE_NAME)?.value) ??
      process.env.AWS_REGION ??
      "us-east-1";

    // Tier 3: endpoint cookie; Tier 4 fallback: env var
    endpoint =
      cookieString(store.get(ENDPOINT_COOKIE_NAME)?.value) ??
      process.env.AWS_ENDPOINT_URL;
  }

  const credentials = nodeChainWithTestFallback();

  return { endpoint, region, credentials };
}

/**
 * Masks a secret value for display purposes.
 * If the secret is longer than 4 characters, shows "••••••••" + last 4.
 * Otherwise, shows "••••••••" entirely.
 */
export function maskSecret(secret: string): string {
  if (secret.length > 4) {
    return "••••••••" + secret.slice(-4);
  }
  return "••••••••";
}
