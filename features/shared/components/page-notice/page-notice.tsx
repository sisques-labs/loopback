import type { ReactNode } from "react";
import { InfoIcon, TriangleAlertIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type PageNoticeVariant = "warning" | "info" | "error";

type PageNoticeProps = {
  variant?: PageNoticeVariant;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
};

const variantClass: Record<PageNoticeVariant, string> = {
  warning: "bg-destructive/8 text-destructive border-destructive/20",
  info: "bg-muted text-muted-foreground border-border",
  error: "bg-destructive/15 text-destructive border-destructive/30",
};

const defaultIcon: Record<PageNoticeVariant, ReactNode> = {
  warning: <TriangleAlertIcon className="size-4 shrink-0" aria-hidden="true" />,
  info: <InfoIcon className="size-4 shrink-0" aria-hidden="true" />,
  error: <TriangleAlertIcon className="size-4 shrink-0" aria-hidden="true" />,
};

export function PageNotice({
  variant = "warning",
  icon,
  children,
  className,
}: PageNoticeProps) {
  const resolvedIcon = icon !== undefined ? icon : defaultIcon[variant];

  return (
    <div
      role="status"
      aria-live="polite"
      data-variant={variant}
      className={cn(
        "flex flex-col items-start gap-2 rounded-lg border px-4 py-3 text-sm min-h-11 sm:flex-row sm:items-center sm:gap-3",
        variantClass[variant],
        className,
      )}
    >
      {resolvedIcon}
      {children}
    </div>
  );
}
