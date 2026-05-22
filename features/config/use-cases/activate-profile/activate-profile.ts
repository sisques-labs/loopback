"use server";
import "server-only";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { PROFILES_COOKIE_NAME, ACTIVE_PROFILE_COOKIE_NAME, COOKIE_OPTIONS } from "@/lib/aws/config";
import { parseProfilesCookie } from "@/lib/aws/profiles";
import type { ActionState } from "@/features/shared/types/action-state";

export async function activateProfileAction(id: string): Promise<ActionState> {
  const store = await cookies();
  const profiles = parseProfilesCookie(store.get(PROFILES_COOKIE_NAME)?.value);

  // Verify the profile exists
  const exists = profiles.some((p) => p.id === id);
  if (!exists) {
    return { status: "error", message: "Profile not found" };
  }

  store.set(ACTIVE_PROFILE_COOKIE_NAME, id, COOKIE_OPTIONS);
  revalidatePath("/", "layout");
  return { status: "success", data: undefined };
}
