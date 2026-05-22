"use server";
import "server-only";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { PROFILES_COOKIE_NAME, ACTIVE_PROFILE_COOKIE_NAME, COOKIE_OPTIONS } from "@/lib/aws/config";
import { parseProfilesCookie, serializeProfiles } from "@/lib/aws/profiles";
import type { ActionState } from "@/features/shared/types/action-state";

export async function deleteProfileAction(id: string): Promise<ActionState> {
  const store = await cookies();
  const profiles = parseProfilesCookie(store.get(PROFILES_COOKIE_NAME)?.value);

  // Check profile exists
  const exists = profiles.some((p) => p.id === id);
  if (!exists) {
    return { status: "error", message: "Profile not found" };
  }

  // Prevent deleting the active profile
  const activeProfileId = store.get(ACTIVE_PROFILE_COOKIE_NAME)?.value;
  if (activeProfileId === id) {
    return { status: "error", message: "Deactivate the profile before deleting it" };
  }

  const remaining = profiles.filter((p) => p.id !== id);
  store.set(PROFILES_COOKIE_NAME, serializeProfiles(remaining), COOKIE_OPTIONS);
  revalidatePath("/", "layout");
  return { status: "success", data: undefined };
}
