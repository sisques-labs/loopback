import { listBuckets } from "@/lib/aws/s3";
import { BucketTable } from "@/components/aws/s3/bucket-table";

export default async function S3Page() {
  const buckets = await listBuckets();

  if (buckets.length === 0) {
    return (
      <div className="flex flex-col items-start gap-4">
        <div>
          <h1 className="text-xl font-semibold">S3 Buckets</h1>
          <p className="mt-1 text-sm text-muted-foreground">No buckets found in this account.</p>
        </div>
        <p className="text-sm text-muted-foreground">
          Create your first bucket to get started.{" "}
          {/* CreateBucketDialog — wired in Slice 3 */}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">S3 Buckets</h1>
        {/* CreateBucketDialog — wired in Slice 3 */}
      </div>
      <BucketTable buckets={buckets} />
    </div>
  );
}
