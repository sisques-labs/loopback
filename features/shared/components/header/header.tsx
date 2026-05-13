import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import type { AppDict } from "@/features/shared/i18n/get-dictionary";

type Props = {
  dict: AppDict["shared"]["header"];
  rightSlot?: ReactNode;
};

export function Header({ dict, rightSlot }: Props) {
  const endpoint = process.env.AWS_ENDPOINT_URL;

  return (
    <header className="flex h-14 items-center gap-4 border-b bg-background px-6">
      <div className="flex flex-1 items-center gap-2">
        <span className="text-sm font-medium text-muted-foreground">{dict.endpoint}</span>
        {endpoint ? (
          <Badge variant="secondary" className="font-mono text-xs">
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
