"use server";
import "server-only";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { PROFILES_COOKIE_NAME } from "@/lib/aws/config";
import { parseProfilesCookie, serializeProfiles, isValidEndpointUrl, nameExists } from "@/lib/aws/profiles";
import { AWS_REGIONS } from "@/lib/aws/regions";
import type { ActionState } from "@/features/shared/types/action-state";

const VALID_REGIONS = new Set(AWS_REGIONS.map((r) => r.value));
const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 60 * 24 * 365,
};

export type UpdateProfileInput = {
  id: string;
  name: string;
  endpoint: string;
  region: string;
};

export async function updateProfileAction(
  _prev: ActionState,
  input: UpdateProfileInput,
): Promise<ActionState> {
  const { id, name, endpoint, region } = input;
  const trimmedName = name.trim();
  const trimmedEndpoint = endpoint.trim();
  const trimmedRegion = region.trim();

  // Validate endpoint
  if (!isValidEndpointUrl(trimmedEndpoint)) {
    return { status: "error", message: "Must be a valid absolute URL" };
  }

  // Validate region
  if (!VALID_REGIONS.has(trimmedRegion)) {
    return { status: "error", message: "Must be a valid AWS region" };
  }

  const store = await cookies();
  const profiles = parseProfilesCookie(store.get(PROFILES_COOKIE_NAME)?.value);

  // Check profile exists
  const existingIndex = profiles.findIndex((p) => p.id === id);
  if (existingIndex === -1) {
    return { status: "error", message: "Profile not found" };
  }

  // Check for name conflict with OTHER profiles (ignore self)
  if (nameExists(profiles, trimmedName, id)) {
    return { status: "error", message: "A profile with this name already exists" };
  }

  const updated = profiles.map((p) =>
    p.id === id
      ? { ...p, name: trimmedName, endpoint: trimmedEndpoint, region: trimmedRegion }
      : p,
  );

  store.set(PROFILES_COOKIE_NAME, serializeProfiles(updated), COOKIE_OPTIONS);
  revalidatePath("/", "layout");
  return { status: "success", data: undefined };
}
