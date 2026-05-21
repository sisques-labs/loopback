"use client";

import { useState, type ReactNode } from "react";
import { UploadIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { InvokeDialog } from "@/features/lambda/components/invoke-dialog/invoke-dialog";
import { UpdateCodeDialog } from "@/features/lambda/components/update-code-dialog/update-code-dialog";
import type { AppDict } from "@/features/shared/i18n/get-dictionary";
import type { Locale } from "@/features/shared/i18n/locale";

type Props = {
  functionName: string;
  locale: Locale;
  invokeDialogDict: AppDict["lambda"]["invokeDialog"];
  updateCodeDialogDict: AppDict["lambda"]["updateCodeDialog"];
  copyButtonDict: AppDict["shared"]["copyButton"];
  replaceCodeCta: string;
  trailing?: ReactNode;
  closeLabel: string;
};

export function LambdaDetailToolbar({
  functionName,
  locale,
  invokeDialogDict,
  updateCodeDialogDict,
  copyButtonDict,
  replaceCodeCta,
  trailing,
  closeLabel,
}: Props) {
  const [updateOpen, setUpdateOpen] = useState(false);

  return (
    <>
      <div className="flex shrink-0 flex-wrap items-center gap-2">
        <InvokeDialog
          functionName={functionName}
          dict={invokeDialogDict}
          copyButtonDict={copyButtonDict}
          locale={locale}
          closeLabel={closeLabel}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="min-h-11 md:min-h-9"
          onClick={() => setUpdateOpen(true)}
        >
          <UploadIcon className="size-4" />
          {replaceCodeCta}
        </Button>
        {trailing}
      </div>
      <UpdateCodeDialog
        functionName={functionName}
        dict={updateCodeDialogDict}
        open={updateOpen}
        onOpenChange={setUpdateOpen}
       closeLabel={closeLabel}/>
    </>
  );
}
