"use server";
import "server-only";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { PROFILES_COOKIE_NAME } from "@/lib/aws/config";
import {
  parseProfilesCookie,
  serializeProfiles,
  isValidProfile,
  MAX_PROFILES,
} from "@/lib/aws/profiles";
import type { Profile } from "@/lib/aws/profiles";
import type { ActionState } from "@/features/shared/types/action-state";

type ImportResult = { imported: number; skipped: number };

const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 60 * 24 * 365,
};

export async function importProfilesAction(
  json: string,
): Promise<ActionState<ImportResult>> {
  // 1. Parse JSON
  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch {
    return { status: "error", message: "Invalid file format" };
  }

  // 2. Must be an array
  if (!Array.isArray(parsed)) {
    return { status: "error", message: "Invalid file format" };
  }

  // 3. Filter to valid Profile items
  const validProfiles = parsed.filter(isValidProfile);
  if (validProfiles.length === 0) {
    return { status: "error", message: "No valid profiles found in file" };
  }

  // 4. Read current profiles from cookie
  const store = await cookies();
  const current = parseProfilesCookie(store.get(PROFILES_COOKIE_NAME)?.value);
  const existingNames = new Set(current.map((p) => p.name));

  // 5. Merge: skip duplicates by name
  const toAdd: Profile[] = [];
  let skipped = 0;

  for (const profile of validProfiles) {
    if (existingNames.has(profile.name)) {
      skipped++;
      continue;
    }
    toAdd.push(profile);
  }

  // 6. Respect MAX_PROFILES cap
  const slots = MAX_PROFILES - current.length;
  if (toAdd.length > slots) {
    skipped += toAdd.length - slots;
    toAdd.splice(slots);
  }

  // 7. Save merged list
  const merged = [...current, ...toAdd];
  store.set(PROFILES_COOKIE_NAME, serializeProfiles(merged), COOKIE_OPTIONS);

  revalidatePath("/", "layout");

  return {
    status: "success",
    data: { imported: toAdd.length, skipped },
  };
}
