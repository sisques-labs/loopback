"use server";
import "server-only";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { REGION_COOKIE_NAME } from "@/lib/aws/config";
import { AWS_REGIONS } from "@/lib/aws/regions";
import type { ActionState } from "@/features/shared/types/action-state";

const VALID_REGIONS = new Set(AWS_REGIONS.map((r) => r.value));

export async function updateRegionAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const raw = ((formData.get("region") as string | null) ?? "").trim();
  const store = await cookies();

  if (raw === "" || !VALID_REGIONS.has(raw)) {
    return { status: "error", message: "Must be a valid AWS region" };
  }

  store.set(REGION_COOKIE_NAME, raw, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
  revalidatePath("/", "layout");
  return { status: "success", data: undefined };
}
