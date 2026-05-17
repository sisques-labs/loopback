import "server-only";

export type CredentialSource = "env" | "profile" | "instance-metadata" | "fallback";

export function resolveCredentialSource(): CredentialSource {
  if (process.env.AWS_PROFILE) return "profile";
  if (process.env.AWS_ACCESS_KEY_ID) return "env";
  return "fallback";
}
