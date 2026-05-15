"use server";

import { CopyObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { revalidatePath } from "next/cache";
import { getS3Client } from "@/lib/aws/client-factory";
import { toFriendlyError } from "@/lib/aws/errors";
import type { ActionState } from "@/features/shared/types/action-state";

export async function renameObjectAction(
  _prev: ActionState<{ newKey: string }>,
  formData: FormData,
): Promise<ActionState<{ newKey: string }>> {
  const bucket = (formData.get("bucket") as string | null) ?? "";
  const oldKey = (formData.get("oldKey") as string | null) ?? "";
  const newKey = (formData.get("newKey") as string | null) ?? "";

  if (!newKey) return { status: "error", message: "Key cannot be empty." };
  if (newKey.startsWith("/")) return { status: "error", message: "Key must not start with a slash." };
  if (newKey.length > 1024) return { status: "error", message: "Key must not exceed 1024 characters." };
  if (newKey === oldKey) return { status: "error", message: "New key must be different from the current key." };

  const client = getS3Client();

  try {
    // AWS SDK v3 requires the CopySource to be URI-encoded (bucket + "/" + key)
    await client.send(
      new CopyObjectCommand({
        Bucket: bucket,
        CopySource: encodeURIComponent(`${bucket}/${oldKey}`),
        Key: newKey,
      }),
    );
  } catch (err) {
    return { status: "error", message: toFriendlyError(err).message };
  }

  try {
    await client.send(new DeleteObjectCommand({ Bucket: bucket, Key: oldKey }));
  } catch (err) {
    // CopyObject succeeded but DeleteObject failed — the object now exists under both keys.
    // We do NOT roll back the copy; the user can manually delete the leftover.
    return { status: "error", message: toFriendlyError(err).message };
  }

  revalidatePath(`/s3/${bucket}`);
  return { status: "success", data: { newKey } };
}
