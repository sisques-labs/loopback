"use client";

import { UploadProgressModal } from "./upload-progress-modal";
import type { AppDict } from "@/features/shared/i18n/get-dictionary";

type Props = {
  dict: AppDict["s3"]["uploadProgress"];
};

export function UploadProgressModalMount({ dict }: Props) {
  return <UploadProgressModal dict={dict} />;
}
