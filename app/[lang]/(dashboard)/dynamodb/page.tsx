import { TableList } from "@/features/dynamodb/components/table-list/table-list";
import { listTables } from "@/features/dynamodb/services/list-tables/list-tables";
import { getDictionary } from "@/features/shared/i18n/get-dictionary";
import { DEFAULT_LOCALE, isLocale, type Locale } from "@/features/shared/i18n/locale";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ lang: string }>;
};

export default async function DynamoDBPage({ params }: Props) {
  const { lang } = await params;
  const locale: Locale = isLocale(lang) ? lang : DEFAULT_LOCALE;
  const dict = getDictionary(locale);
  const localePrefix = `/${locale}`;

  const tables = await listTables().catch(() => []);

  return (
    <TableList
      tables={tables}
      dict={dict.dynamodb}
      confirmDict={dict.shared.confirmDialog}
      closeLabel={dict.shared.dialog.close}
      locale={locale}
      localePrefix={localePrefix}
    />
  );
}
