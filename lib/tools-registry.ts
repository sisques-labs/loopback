import { TerminalIcon, DatabaseZapIcon, ActivityIcon } from "lucide-react";
import type { ToolEntry } from "@/features/shared/types/service-entry";

export const tools: ToolEntry[] = [
  { id: "terminal", label: "Terminal", href: "/terminal", icon: TerminalIcon },
  { id: "seed", label: "Demo Data", href: "/seed", icon: DatabaseZapIcon },
  { id: "timeline", label: "Timeline", href: "/timeline", icon: ActivityIcon },
];
