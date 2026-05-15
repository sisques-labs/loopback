import type { AppDict } from "@/features/shared/i18n/get-dictionary";

export function stateBadgeVariant(state: string): "default" | "secondary" | "destructive" | "outline" {
  switch (state.toLowerCase()) {
    case "active":
      return "default";
    case "pending":
      return "secondary";
    case "failed":
      return "destructive";
    case "inactive":
      return "outline";
    default:
      return "outline";
  }
}

export function stateLabel(state: string, dict: AppDict["lambda"]["table"]): string {
  switch (state.toLowerCase()) {
    case "active":
      return dict.stateActive;
    case "pending":
      return dict.statePending;
    case "failed":
      return dict.stateFailed;
    case "inactive":
      return dict.stateInactive;
    default:
      return dict.stateUnknown;
  }
}
