import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import type { AppDict } from "@/features/shared/i18n/get-dictionary";

type Props = {
  dict: AppDict["shared"]["header"];
  leftSlot?: ReactNode;
  rightSlot?: ReactNode;
};

export function Header({ dict, leftSlot, rightSlot }: Props) {
  const endpoint = process.env.AWS_ENDPOINT_URL;

  return (
    <header className="flex h-14 items-center gap-2 border-b bg-background px-4 md:px-6">
      {leftSlot}
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <span className="shrink-0 text-sm font-medium text-muted-foreground">{dict.endpoint}</span>
        {endpoint ? (
          <Badge variant="secondary" className="max-w-[200px] truncate font-mono text-xs">
            {endpoint}
          </Badge>
        ) : (
          <Badge variant="destructive" className="text-xs">
            {dict.endpointNotSet}
          </Badge>
        )}
      </div>
      {rightSlot}
    </header>
  );
}
