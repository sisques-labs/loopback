import type { LogCriteria, LogFilters } from "@/features/logs/lib/types/types";
import { AndCriteria } from "@/features/logs/lib/and-criteria/and-criteria";
import { LevelCriteria } from "@/features/logs/lib/level-criteria/level-criteria";
import { ServiceCriteria } from "@/features/logs/lib/service-criteria/service-criteria";
import { TextCriteria } from "@/features/logs/lib/text-criteria/text-criteria";

export function buildCriteria(filters: LogFilters): AndCriteria {
  const list: LogCriteria[] = [];

  if (filters.service && filters.service !== "all") {
    list.push(new ServiceCriteria(filters.service));
  }

  if (filters.level && filters.level !== "all") {
    list.push(new LevelCriteria(filters.level));
  }

  if (filters.text.trim() !== "") {
    list.push(new TextCriteria(filters.text));
  }

  return new AndCriteria(list);
}
