"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { AppDict } from "@/features/shared/i18n/get-dictionary";

export type QueryFormProps = {
  tableName: string;
  partitionKeyName: string;
  sortKeyName?: string;
  initialPk?: string;
  initialSk?: string;
  localePrefix: string;
  dict: AppDict["dynamodb"]["query"];
};

export function QueryForm({
  tableName,
  partitionKeyName,
  sortKeyName,
  initialPk = "",
  initialSk = "",
  localePrefix,
  dict,
}: QueryFormProps) {
  const router = useRouter();
  const [pk, setPk] = useState(initialPk);
  const [sk, setSk] = useState(initialSk);
  const [pkError, setPkError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmedPk = pk.trim();
    if (!trimmedPk) {
      setPkError(dict.pkRequired);
      return;
    }
    setPkError(null);

    const params = new URLSearchParams();
    params.set("mode", "query");
    params.set("queryPk", trimmedPk);
    const trimmedSk = sk.trim();
    if (sortKeyName && trimmedSk) {
      params.set("querySk", trimmedSk);
    }

    router.push(
      `${localePrefix}/dynamodb/${encodeURIComponent(tableName)}?${params.toString()}`,
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-lg border border-border p-4">
      <p className="text-sm text-muted-foreground">{dict.pkHint}</p>

      <div className="flex flex-col gap-2">
        <Label htmlFor="query-pk">{dict.pkLabel}</Label>
        <Input
          id="query-pk"
          name="queryPk"
          value={pk}
          onChange={(e) => {
            setPk(e.target.value);
            if (pkError) setPkError(null);
          }}
          placeholder={dict.pkPlaceholder}
          className="min-h-11 font-mono md:min-h-9"
          aria-invalid={pkError ? true : undefined}
          aria-describedby={pkError ? "query-pk-error" : undefined}
        />
        {pkError && (
          <p id="query-pk-error" className="text-sm text-destructive">
            {pkError}
          </p>
        )}
      </div>

      {sortKeyName && (
        <div className="flex flex-col gap-2">
          <Label htmlFor="query-sk">{dict.skLabel}</Label>
          <Input
            id="query-sk"
            name="querySk"
            value={sk}
            onChange={(e) => setSk(e.target.value)}
            placeholder={dict.skPlaceholder}
            className="min-h-11 font-mono md:min-h-9"
          />
        </div>
      )}

      <div>
        <Button type="submit" className="min-h-11 min-w-11 md:min-h-9 md:min-w-9">
          {dict.search}
        </Button>
      </div>
    </form>
  );
}
