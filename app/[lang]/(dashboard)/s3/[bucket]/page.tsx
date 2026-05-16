import { ObjectTable } from "@/features/s3/components/object-table/object-table";
import { UploadDialog } from "@/features/s3/components/upload-dialog/upload-dialog";
import { DropZoneWrapper } from "@/features/s3/components/drop-zone-wrapper/drop-zone-wrapper";
import { listObjects } from "@/features/s3/services/list-objects/list-objects";
import { getDictionary } from "@/features/shared/i18n/get-dictionary";
import { DEFAULT_LOCALE, isLocale, type Locale } from "@/features/shared/i18n/locale";

/** Same as s3/page — listObjects needs a live S3-compatible endpoint at request time. */
export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ lang: string; bucket: string }>;
};

export default async function BucketPage({ params }: Props) {
  const { lang, bucket } = await params;
  const locale: Locale = isLocale(lang) ? lang : DEFAULT_LOCALE;
  const dict = getDictionary(locale);
  const s3 = dict.s3;
  const shared = dict.shared;
  const objects = await listObjects(bucket);

  if (objects.length === 0) {
    return (
      <DropZoneWrapper bucket={bucket} prefix="" dict={s3.uploadDialog}>
        <div className="flex flex-col items-start gap-4">
          <div className="flex w-full min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
            <div className="min-w-0">
              <h1 className="text-xl font-semibold break-words">{bucket}</h1>
              <p className="mt-1 text-sm text-muted-foreground">{s3.bucketDetail.empty}</p>
            </div>
            <UploadDialog bucket={bucket} dict={s3.uploadDialog} closeLabel={shared.dialog.close}/>
          </div>
        </div>
      </DropZoneWrapper>
    );
  }

  return (
    <DropZoneWrapper bucket={bucket} prefix="" dict={s3.uploadDialog}>
      <div className="flex flex-col gap-4">
        <h1 className="min-w-0 text-xl font-semibold break-words">{bucket}</h1>
        <ObjectTable
          bucket={bucket}
          objects={objects}
          dict={s3.objectTable}
          uploadDict={s3.uploadDialog}
          rowActionsDict={s3.objectRowActions}
          renameActionsDict={s3.renameObjectDialog}
          confirmDict={shared.confirmDialog}
          previewDict={s3.previewDialog}
          closeLabel={shared.dialog.close}
        />
      </div>
    </DropZoneWrapper>
  );
}
