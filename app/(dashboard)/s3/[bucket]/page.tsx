import { listObjects } from "@/features/s3/services";
import { ObjectTable } from "@/features/s3/components/object-table";
import { UploadDialog } from "@/features/s3/components/upload-dialog";

type Props = {
  params: Promise<{ bucket: string }>;
};

export default async function BucketPage({ params }: Props) {
  const { bucket } = await params;
  const objects = await listObjects(bucket);

  if (objects.length === 0) {
    return (
      <div className="flex flex-col items-start gap-4">
        <div className="flex w-full items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold">{bucket}</h1>
            <p className="mt-1 text-sm text-muted-foreground">This bucket is empty.</p>
          </div>
          <UploadDialog bucket={bucket} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold">{bucket}</h1>
      <ObjectTable bucket={bucket} objects={objects} />
    </div>
  );
}
