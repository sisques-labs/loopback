import type { Metadata } from "next";
import { getDictionary } from "@/features/shared/i18n/get-dictionary";
import { DEFAULT_LOCALE, isLocale, type Locale } from "@/features/shared/i18n/locale";
import { isPresetSlug } from "@/features/seed/presets";

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

  const validatedPreset = isPresetSlug(presetParam) ? presetParam : undefined;

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold">{dict.seed.page.title}</h1>
      <p className="text-muted-foreground text-sm">{dict.seed.page.description}</p>
      {/* SeedClient will be wired in PR-3 */}
      {validatedPreset && (
        <p className="sr-only" data-testid="selected-preset">{validatedPreset}</p>
      )}
    </div>
  );
}
