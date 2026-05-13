"use server";

import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { revalidatePath } from "next/cache";
import { getS3Client } from "@/lib/aws/client-factory";
import { toFriendlyError } from "@/lib/aws/errors";
import type { ActionState } from "@/types/aws";

export async function deleteObjectAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const bucket = (formData.get("bucket") as string | null) ?? "";
  const key = (formData.get("key") as string | null) ?? "";
  if (!bucket || !key) return { status: "error", message: "Bucket and key are required." };

  try {
    const client = getS3Client();
    await client.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
    revalidatePath(`/s3/${bucket}`);
    return { status: "success", data: undefined };
  } catch (err) {
    const friendly = toFriendlyError(err);
    if (friendly.code === "NoSuchKey") {
      revalidatePath(`/s3/${bucket}`);
      return { status: "success", data: undefined };
    }
    return { status: "error", message: friendly.message };
  }
}
