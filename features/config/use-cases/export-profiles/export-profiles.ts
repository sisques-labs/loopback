"use server";
import "server-only";

import { cookies } from "next/headers";
import { PROFILES_COOKIE_NAME } from "@/lib/aws/config";
import { parseProfilesCookie } from "@/lib/aws/profiles";
import type { ActionState } from "@/features/shared/types/action-state";

export async function exportProfilesAction(): Promise<ActionState<string>> {
  const store = await cookies();
  const profiles = parseProfilesCookie(store.get(PROFILES_COOKIE_NAME)?.value);
  return { status: "success", data: JSON.stringify(profiles) };
}
