import { Badge } from "@/components/ui/badge";

export function Header() {
  const endpoint = process.env.AWS_ENDPOINT_URL;

  return (
    <header className="flex h-14 items-center gap-4 border-b bg-background px-6">
      <div className="flex flex-1 items-center gap-2">
        <span className="text-sm font-medium text-muted-foreground">Endpoint</span>
        {endpoint ? (
          <Badge variant="secondary" className="font-mono text-xs">
            {endpoint}
          </Badge>
        ) : (
          <Badge variant="destructive" className="text-xs">
            AWS_ENDPOINT_URL not set
          </Badge>
        )}
      </div>
    </header>
  );
}
