import type { Metadata } from "next";
import { getDictionary } from "@/features/shared/i18n/get-dictionary";
import { DEFAULT_LOCALE, isLocale, type Locale } from "@/features/shared/i18n/locale";
import { isPresetSlug } from "@/features/seed/presets/schema";
import { PresetPicker } from "@/features/seed/components/preset-picker/preset-picker";
import { LoadButton } from "@/features/seed/components/load-button/load-button";
import { ResetPanel } from "@/features/seed/components/reset-panel/reset-panel";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ preset?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  const locale: Locale = isLocale(lang) ? lang : DEFAULT_LOCALE;
  const dict = getDictionary(locale);
  return {
    title: dict.seed.page.title,
  };
}

export default async function SeedPage({ params, searchParams }: Props) {
  const { lang } = await params;
  const { preset: presetParam } = await searchParams;
  const locale: Locale = isLocale(lang) ? lang : DEFAULT_LOCALE;
  const dict = getDictionary(locale);
  const localePrefix = `/${locale}`;

  const validatedPreset = isPresetSlug(presetParam) ? presetParam : undefined;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-xl font-semibold">{dict.seed.page.title}</h1>
        <p className="text-muted-foreground text-sm">{dict.seed.page.description}</p>
      </div>

      <PresetPicker
        dict={dict.seed.presets}
        selectedPreset={validatedPreset}
        localePrefix={localePrefix}
      />

      <LoadButton
        selectedPreset={validatedPreset}
        dict={dict.seed.load}
        resultsDict={dict.seed.results}
      />

      <hr className="border-border" />

      <ResetPanel
        dict={dict.seed.reset}
        resultsDict={dict.seed.results}
      />
    </div>
  );
}
