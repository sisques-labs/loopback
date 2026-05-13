"use server";

import { CreateBucketCommand } from "@aws-sdk/client-s3";
import { revalidatePath } from "next/cache";
import { getS3Client } from "@/lib/aws/client-factory";
import { toFriendlyError } from "@/lib/aws/errors";
import type { ActionState } from "@/features/shared/types/action-state";

const S3_BUCKET_NAME_REGEX = /^[a-z0-9][a-z0-9.-]{1,61}[a-z0-9]$/;

function validateBucketName(name: string): string | null {
  if (!name || name.trim().length === 0) return "Bucket name is required.";
  const trimmed = name.trim();
  if (!S3_BUCKET_NAME_REGEX.test(trimmed))
    return "Bucket name must be 3–63 characters, lowercase letters, numbers, hyphens, or dots only.";
  if (trimmed.includes("..")) return "Bucket name must not contain consecutive dots.";
  if (trimmed.startsWith("xn--")) return "Bucket name must not start with 'xn--'.";
  if (trimmed.endsWith("-s3alias")) return "Bucket name must not end with '-s3alias'.";
  return null;
}

export async function createBucketAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const name = (formData.get("name") as string | null) ?? "";
  const validationError = validateBucketName(name);
  if (validationError) return { status: "error", message: validationError };

  try {
    const client = getS3Client();
    await client.send(new CreateBucketCommand({ Bucket: name.trim() }));
    revalidatePath("/s3");
    return { status: "success", data: undefined };
  } catch (err) {
    const { message } = toFriendlyError(err);
    return { status: "error", message };
  }
}
