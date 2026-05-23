"use server";

import "server-only";

import { snapshotDocumentSchema } from "@/features/snapshots/lib/schema/snapshot-schema";
import type { ActionState } from "@/features/shared/types/action-state";
import type { SnapshotDocument } from "@/features/snapshots/lib/types/snapshot";

export async function importSnapshotAction(
  _prev: ActionState<SnapshotDocument>,
  formData: FormData,
): Promise<ActionState<SnapshotDocument>> {
  const file = formData.get("file");
  if (!file || !(file instanceof File)) {
    return { status: "error", message: "No file provided." };
  }

  let parsed: unknown;
  try {
    const text = await file.text();
    parsed = JSON.parse(text);
  } catch {
    return { status: "error", message: "Invalid JSON file." };
  }

  const parseResult = snapshotDocumentSchema.safeParse(parsed);
  if (!parseResult.success) {
    return {
      status: "error",
      message: `Invalid snapshot format: ${parseResult.error.issues[0]?.message ?? "unknown"}`,
    };
  }

  return { status: "success", data: parseResult.data as SnapshotDocument };
}
