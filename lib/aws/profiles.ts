export const MAX_PROFILES = 10;

export interface Profile {
  id: string;
  name: string;
  endpoint: string;
  region: string;
}

export type ProfileInput = {
  name: string;
  endpoint: string;
  region: string;
};

function isProfile(item: unknown): item is Profile {
  if (typeof item !== "object" || item === null) return false;
  const obj = item as Record<string, unknown>;
  return (
    typeof obj.id === "string" &&
    typeof obj.name === "string" &&
    typeof obj.endpoint === "string" &&
    typeof obj.region === "string"
  );
}

/**
 * Parses the `aws-profiles` cookie value into an array of Profile objects.
 * Returns [] on any parse error, malformed JSON, non-array value, or
 * items missing required string fields.
 */
export function parseProfilesCookie(value: string | undefined): Profile[] {
  if (!value || value.trim() === "") return [];
  try {
    const parsed: unknown = JSON.parse(value);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isProfile);
  } catch {
    return [];
  }
}

/**
 * Finds the active profile from a list by its ID stored in the
 * `aws-active-profile` cookie. Returns null if the value is undefined
 * or the ID is not found in the profiles array.
 */
export function parseActiveProfileCookie(
  value: string | undefined,
  profiles: Profile[],
): Profile | null {
  if (!value) return null;
  return profiles.find((p) => p.id === value) ?? null;
}

/**
 * Serializes a profiles array to a JSON string suitable for cookie storage.
 */
export function serializeProfiles(profiles: Profile[]): string {
  return JSON.stringify(profiles);
}
