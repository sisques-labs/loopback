import type { Metadata } from "next";
import { getDictionary } from "@/features/shared/i18n/get-dictionary";
import { DEFAULT_LOCALE, isLocale, type Locale } from "@/features/shared/i18n/locale";
import { SnapshotPanel } from "@/features/snapshots/components/snapshot-panel/snapshot-panel";
import { ImportExportPanel } from "@/features/snapshots/components/import-export-panel/import-export-panel";
import { RestorePanel } from "@/features/snapshots/components/restore-panel/restore-panel";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ lang: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  const locale: Locale = isLocale(lang) ? lang : DEFAULT_LOCALE;
  const dict = getDictionary(locale);
  return {
    title: dict.snapshots.page.title,
  };
}

export default async function SnapshotsPage({ params }: Props) {
  const { lang } = await params;
  const locale: Locale = isLocale(lang) ? lang : DEFAULT_LOCALE;
  const dict = getDictionary(locale);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-xl font-semibold">{dict.snapshots.page.title}</h1>
        <p className="text-muted-foreground text-sm">{dict.snapshots.page.description}</p>
      </div>

      <SnapshotPanel dict={dict.snapshots} />

      <hr className="border-border" />

      <ImportExportPanel dict={dict.snapshots} />

      <hr className="border-border" />

      <RestorePanel dict={dict.snapshots} />
    </div>
  );
}
