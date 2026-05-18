"use server";
import "server-only";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { ACTIVE_PROFILE_COOKIE_NAME } from "@/lib/aws/config";
import type { ActionState } from "@/features/shared/types/action-state";

export async function deactivateProfileAction(): Promise<ActionState> {
  const store = await cookies();
  store.delete(ACTIVE_PROFILE_COOKIE_NAME);
  revalidatePath("/", "layout");
  return { status: "success", data: undefined };
}
