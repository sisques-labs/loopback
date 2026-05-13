import { listObjects } from "@/lib/aws/s3";
import { ObjectTable } from "@/components/aws/s3/object-table";

type Props = {
  params: Promise<{ bucket: string }>;
};

export default async function BucketPage({ params }: Props) {
  const { bucket } = await params;
  const objects = await listObjects(bucket);

  if (objects.length === 0) {
    return (
      <div className="flex flex-col items-start gap-4">
        <div>
          <h1 className="text-xl font-semibold">{bucket}</h1>
          <p className="mt-1 text-sm text-muted-foreground">This bucket is empty.</p>
        </div>
        <p className="text-sm text-muted-foreground">
          Upload your first object to get started.{" "}
          {/* UploadDialog — wired in Slice 3 */}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">{bucket}</h1>
        {/* UploadDialog — wired in Slice 3 */}
      </div>
      <ObjectTable bucket={bucket} objects={objects} />
    </div>
  );
}
