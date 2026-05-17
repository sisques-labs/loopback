"use server";
import "server-only";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { ENDPOINT_COOKIE_NAME } from "@/lib/aws/config";
import type { ActionState } from "@/features/shared/types/action-state";

export async function updateEndpointAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const raw = ((formData.get("endpoint") as string | null) ?? "").trim();
  const store = await cookies();

  // Clear flow: empty string deletes the override cookie
  if (raw === "") {
    store.delete(ENDPOINT_COOKIE_NAME);
    revalidatePath("/", "layout");
    return { status: "success", data: undefined };
  }

  // Validate: must be a parseable absolute URL
  let parsed: URL;
  try {
    parsed = new URL(raw);
  } catch {
    return { status: "error", message: "Must be a valid absolute URL" };
  }

  store.set(ENDPOINT_COOKIE_NAME, parsed.toString(), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
  revalidatePath("/", "layout");
  return { status: "success", data: undefined };
}
