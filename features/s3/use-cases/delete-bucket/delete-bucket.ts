"use server";

import { DeleteBucketCommand } from "@aws-sdk/client-s3";
import { revalidatePath } from "next/cache";
import { getS3Client } from "@/lib/aws/client-factory";
import { toFriendlyError } from "@/lib/aws/errors";
import type { ActionState } from "@/features/shared/types/action-state";

export async function deleteBucketAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const bucket = (formData.get("bucket") as string | null) ?? "";
  if (!bucket) return { status: "error", message: "Bucket name is required." };

  try {
    const client = await getS3Client();
    await client.send(new DeleteBucketCommand({ Bucket: bucket }));
    revalidatePath("/s3");
    return { status: "success", data: undefined };
  } catch (err) {
    const { message } = toFriendlyError(err);
    return { status: "error", message };
  }
}
