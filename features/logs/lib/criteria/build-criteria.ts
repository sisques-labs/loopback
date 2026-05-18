import type { LogCriteria, LogFilters } from "./types";
import { ServiceCriteria } from "./service-criteria";
import { LevelCriteria } from "./level-criteria";
import { TextCriteria } from "./text-criteria";
import { AndCriteria } from "./and-criteria";

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
