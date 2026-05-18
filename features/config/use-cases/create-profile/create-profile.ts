"use server";
import "server-only";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { PROFILES_COOKIE_NAME, ACTIVE_PROFILE_COOKIE_NAME } from "@/lib/aws/config";
import {
  parseProfilesCookie,
  serializeProfiles,
  MAX_PROFILES,
} from "@/lib/aws/profiles";
import { AWS_REGIONS } from "@/lib/aws/regions";
import type { ActionState } from "@/features/shared/types/action-state";

const VALID_REGIONS = new Set(AWS_REGIONS.map((r) => r.value));
const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 60 * 24 * 365,
};

export async function createProfileAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const name = ((formData.get("name") as string | null) ?? "").trim();
  const endpoint = ((formData.get("endpoint") as string | null) ?? "").trim();
  const region = ((formData.get("region") as string | null) ?? "").trim();

  // Validate name
  if (name === "") {
    return { status: "error", message: "Profile name is required" };
  }

  // Validate endpoint
  try {
    new URL(endpoint);
  } catch {
    return { status: "error", message: "Must be a valid absolute URL" };
  }

  // Validate region
  if (!VALID_REGIONS.has(region)) {
    return { status: "error", message: "Must be a valid AWS region" };
  }

  const store = await cookies();
  const profiles = parseProfilesCookie(store.get(PROFILES_COOKIE_NAME)?.value);

  // Check cap
  if (profiles.length >= MAX_PROFILES) {
    return { status: "error", message: "Maximum of 10 profiles reached" };
  }

  // Check duplicate name
  if (profiles.some((p) => p.name === name)) {
    return { status: "error", message: "A profile with this name already exists" };
  }

  const newProfile = {
    id: crypto.randomUUID(),
    name,
    endpoint,
    region,
  };

  store.set(PROFILES_COOKIE_NAME, serializeProfiles([...profiles, newProfile]), COOKIE_OPTIONS);
  revalidatePath("/", "layout");
  return { status: "success", data: undefined };
}
