"use server";

import { listTopics } from "@/features/sns/services/list-topics/list-topics";
import type { Topic } from "@/features/sns/types/sns";

export async function listTopicsAction(): Promise<Topic[]> {
  return listTopics();
}
