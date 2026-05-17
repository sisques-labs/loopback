import "server-only";
import { cookies } from "next/headers";
import { fromNodeProviderChain } from "@aws-sdk/credential-providers";
import type { AwsCredentialIdentity, Provider } from "@aws-sdk/types";

export const ENDPOINT_COOKIE_NAME = "aws-endpoint-override";

export type AwsClientConfig = {
  endpoint: string | undefined;
  region: string;
  credentials: AwsCredentialIdentity | Provider<AwsCredentialIdentity>;
};

/**
 * Returns a credentials provider that delegates to the node provider chain
 * and falls back to static test credentials if the chain throws.
 *
 * NOTE: The fallback is intentional — this tool targets local dev against
 * LocalStack where "test/test" is the canonical default.
 */
function nodeChainWithTestFallback(): Provider<AwsCredentialIdentity> {
  const chain = fromNodeProviderChain();
  return async () => {
    try {
      return await chain();
    } catch {
      return { accessKeyId: "test", secretAccessKey: "test" };
    }
  };
}

/**
 * Creates a fresh AWS client config on every call.
 *
 * IMPORTANT: There is intentionally NO module-level cache here.
 * The endpoint is read from the httpOnly cookie on each request so that
 * an endpoint override set via the Settings UI takes effect immediately
 * without requiring a process restart.
 */
export async function createAwsConfig(): Promise<AwsClientConfig> {
  const store = await cookies();
  const cookieValue = store.get(ENDPOINT_COOKIE_NAME)?.value;

  let endpoint: string | undefined;
  if (cookieValue && cookieValue.trim() !== "") {
    endpoint = cookieValue;
  } else if (process.env.AWS_ENDPOINT_URL) {
    endpoint = process.env.AWS_ENDPOINT_URL;
  } else {
    endpoint = undefined;
  }

  const region = process.env.AWS_REGION ?? "us-east-1";
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
