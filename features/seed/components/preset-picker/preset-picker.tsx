"use client";

import { useRouter } from "next/navigation";
import type { PresetSlug } from "@/features/seed/presets/schema";

type PresetDict = {
  name: string;
  description: string;
};

export type PresetPickerDict = {
  sectionTitle: string;
  ecommerce: PresetDict;
  blog: PresetDict;
  eventDriven: PresetDict;
};

type Props = {
  dict: PresetPickerDict;
  selectedPreset: PresetSlug | undefined;
  localePrefix: string;
};

const PRESETS: Array<{ slug: PresetSlug; dictKey: keyof Omit<PresetPickerDict, "sectionTitle"> }> =
  [
    { slug: "ecommerce", dictKey: "ecommerce" },
    { slug: "blog", dictKey: "blog" },
    { slug: "event-driven", dictKey: "eventDriven" },
  ];

export function PresetPicker({ dict, selectedPreset, localePrefix }: Props) {
  const router = useRouter();

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
        {dict.sectionTitle}
      </h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {PRESETS.map(({ slug, dictKey }) => {
          const preset = dict[dictKey];
          const isSelected = selectedPreset === slug;

          return (
            <button
              key={slug}
              type="button"
              role="button"
              aria-pressed={isSelected}
              className={`min-h-11 flex flex-col gap-1 rounded-lg border p-4 text-left transition-colors ${
                isSelected
                  ? "border-primary bg-primary/5 ring-2 ring-primary"
                  : "border-border bg-card hover:border-primary/50 hover:bg-muted/50"
              }`}
              onClick={() => {
                router.push(`${localePrefix}/seed?preset=${slug}`);
              }}
            >
              <span className="font-medium text-sm">{preset.name}</span>
              <span className="text-xs text-muted-foreground leading-snug">
                {preset.description}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
