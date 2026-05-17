"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { CheckCircle2Icon, DatabaseIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { seedItemsAction } from "@/features/dynamodb/use-cases/seed-items/seed-items";
import { parseCSV } from "@/features/shared/utils/parse-csv/parse-csv";
import type { AppDict } from "@/features/shared/i18n/get-dictionary";
import type { Locale } from "@/features/shared/i18n/locale";
import type { ActionState } from "@/features/shared/types/action-state";

// ─── SeedDialog state ─────────────────────────────────────────────────────────

type Phase = "idle" | "ready" | "error" | "submitting";

type SeedState = {
  phase: Phase;
  items: unknown[] | null;
  parseError: string | null;
  oversized: boolean;
  fileName: string | null;
};

const INITIAL_SEED_STATE: SeedState = {
  phase: "idle",
  items: null,
  parseError: null,
  oversized: false,
  fileName: null,
};

const INITIAL_ACTION_STATE: ActionState<{ written: number; failed: number }> = {
  status: "idle",
};

// ─── Props ────────────────────────────────────────────────────────────────────

type Props = {
  tableName: string;
  dict: AppDict["dynamodb"]["seedDialog"];
  locale: Locale;
  closeLabel: string;
};

// ─── Component ───────────────────────────────────────────────────────────────

export function SeedDialog({ tableName, dict, locale, closeLabel }: Props) {
  const [seedState, setSeedState] = useState<SeedState>(INITIAL_SEED_STATE);
  const [overwrite, setOverwrite] = useState(true);
  const fileRef = useRef<HTMLInputElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  const [actionState, formAction, pending] = useActionState(
    seedItemsAction,
    INITIAL_ACTION_STATE,
  );

  useEffect(() => {
    if (actionState.status === "success") {
      const count = actionState.data?.written ?? 0;
      toast.success(dict.successToast.replace("{count}", String(count)));
      closeRef.current?.click();
    }
  }, [actionState, dict.successToast]);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const ext = file.name.split(".").pop()?.toLowerCase();
    if (ext !== "json" && ext !== "csv") {
      setSeedState({
        phase: "error",
        items: null,
        parseError: dict.errorInvalidFile,
        oversized: false,
        fileName: file.name,
      });
      return;
    }

    const oversized = file.size > 500_000;
    const text = await file.text();

    if (ext === "json") {
      let parsed: unknown;
      try {
        parsed = JSON.parse(text);
      } catch {
        setSeedState({
          phase: "error",
          items: null,
          parseError: dict.errorParseJson,
          oversized,
          fileName: file.name,
        });
        return;
      }

      if (!Array.isArray(parsed)) {
        setSeedState({
          phase: "error",
          items: null,
          parseError: dict.errorParseJson,
          oversized,
          fileName: file.name,
        });
        return;
      }

      if (parsed.length === 0) {
        setSeedState({
          phase: "error",
          items: null,
          parseError: dict.errorEmptyArray,
          oversized,
          fileName: file.name,
        });
        return;
      }

      setSeedState({ phase: "ready", items: parsed, parseError: null, oversized, fileName: file.name });
      return;
    }

    // CSV
    const rows = parseCSV(text);
    if (rows.length === 0) {
      setSeedState({
        phase: "error",
        items: null,
        parseError: dict.errorParseCsv,
        oversized,
        fileName: file.name,
      });
      return;
    }

    setSeedState({ phase: "ready", items: rows, parseError: null, oversized, fileName: file.name });
  }

  const isSubmitDisabled =
    pending || seedState.phase === "idle" || seedState.phase === "error";

  return (
    <Dialog>
      <DialogTrigger render={<Button size="sm" className="min-h-11 min-w-11 md:min-h-9 md:min-w-9" />}>
        <DatabaseIcon />
        {dict.trigger}
      </DialogTrigger>
      <DialogContent closeLabel={closeLabel} className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{dict.title}</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">{dict.description}</p>

        <form action={formAction} className="flex flex-col gap-4">
          {/* Hidden fields — itemsJson is set from state and updated on every render */}
          <input type="hidden" name="tableName" value={tableName} />
          <input type="hidden" name="locale" value={locale} />
          <input
            type="hidden"
            name="itemsJson"
            value={seedState.items ? JSON.stringify(seedState.items) : ""}
          />

          {/* File input */}
          <div className="flex flex-col gap-1.5">
            <Label>{dict.fileLabel}</Label>
            <input
              ref={fileRef}
              type="file"
              accept=".json,.csv"
              className="sr-only"
              onChange={handleFileChange}
              aria-label={dict.fileLabel}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-full min-h-11"
              onClick={() => fileRef.current?.click()}
            >
              {dict.fileLabel}
            </Button>
            <p className="text-xs text-muted-foreground">{dict.fileHint}</p>

            {seedState.phase === "ready" && seedState.fileName && seedState.items && (
              <div className="flex items-center gap-1.5 text-xs text-emerald-600">
                <CheckCircle2Icon className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate font-medium">{seedState.fileName}</span>
                <span className="shrink-0 text-muted-foreground">— {seedState.items.length} items</span>
              </div>
            )}

            {seedState.oversized && (
              <p className="text-xs text-amber-600">{dict.fileSizeWarning}</p>
            )}

            {seedState.parseError && (
              <p className="text-xs text-destructive">{seedState.parseError}</p>
            )}
          </div>

          {/* Overwrite checkbox */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
              <Checkbox
                checked={overwrite}
                onCheckedChange={(checked) => setOverwrite(checked === true)}
                id="overwrite-checkbox"
              />
              <Label htmlFor="overwrite-checkbox">{dict.overwriteLabel}</Label>
            </div>
            {!overwrite && (
              <p className="text-xs text-muted-foreground">{dict.overwriteHint}</p>
            )}
          </div>

          {/* Action error from server */}
          {actionState.status === "error" && (
            <p className="text-xs text-destructive">{actionState.message}</p>
          )}

          <DialogFooter>
            <DialogClose
              ref={closeRef}
              render={<Button variant="outline" type="button" />}
            >
              {dict.cancel}
            </DialogClose>
            <Button type="submit" disabled={isSubmitDisabled}>
              {pending ? dict.importing : dict.submit}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
