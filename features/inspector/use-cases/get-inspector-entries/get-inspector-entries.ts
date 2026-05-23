"use server";

import "server-only";
import { getEntries, clearEntries } from "@/lib/aws/inspector-buffer";
import type { RequestEntry } from "@/features/inspector/lib/types/types";
import type { ActionState } from "@/features/shared/types/action-state";

export type GetInspectorEntriesInput = {
  since?: number; // epoch ms; client passes lastUpdatedAt for incremental polls
};

export type GetInspectorEntriesData = {
  entries: RequestEntry[];
};

export async function getInspectorEntriesAction(
  input: GetInspectorEntriesInput = {},
): Promise<ActionState<GetInspectorEntriesData>> {
  try {
    const all = getEntries();
    const filtered =
      input.since == null
        ? [...all]
        : all.filter((e) => e.timestamp >= input.since!);
    return { status: "success", data: { entries: filtered } };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to read inspector buffer.";
    return { status: "error", message };
  }
}

export async function clearInspectorBufferAction(): Promise<ActionState<void>> {
  try {
    clearEntries();
    return { status: "success", data: undefined };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to clear inspector buffer.";
    return { status: "error", message };
  }
}
