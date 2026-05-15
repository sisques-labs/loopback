import { BucketTable } from "@/features/s3/components/bucket-table/bucket-table";
import { CreateBucketDialog } from "@/features/s3/components/create-bucket-dialog/create-bucket-dialog";
import { listBuckets } from "@/features/s3/services/list-buckets/list-buckets";
import { getDictionary } from "@/features/shared/i18n/get-dictionary";
import { DEFAULT_LOCALE, isLocale, type Locale } from "@/features/shared/i18n/locale";

/** S3 is only available at runtime; prerender would call AWS during `next build` (e.g. Docker). */
export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ lang: string }>;
};

export default async function S3Page({ params }: Props) {
  const { lang } = await params;
  const locale: Locale = isLocale(lang) ? lang : DEFAULT_LOCALE;
  const dict = getDictionary(locale);
  const s3 = dict.s3;
  const shared = dict.shared;
  const localePrefix = `/${locale}`;
  const buckets = await listBuckets();

  if (buckets.length === 0) {
    return (
      <div className="flex flex-col items-start gap-4">
        <div className="flex w-full min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <div className="min-w-0">
            <h1 className="text-xl font-semibold break-words">{s3.page.title}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{s3.page.empty}</p>
          </div>
          <CreateBucketDialog dict={s3.createBucketDialog}  closeLabel={shared.dialog.close}/>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <h1 className="text-xl font-semibold break-words">{s3.page.title}</h1>
        <CreateBucketDialog dict={s3.createBucketDialog}  closeLabel={shared.dialog.close}/>
      </div>
      <BucketTable
        buckets={buckets}
        dict={s3.bucketTable}
        localePrefix={localePrefix}
        rowActionsDict={s3.bucketRowActions}
        confirmDict={shared.confirmDialog}
        closeLabel={shared.dialog.close}
      />
    </div>
  );
}
