"use client";

import { useState } from "react";
import Link from "next/link";
import { MoreHorizontalIcon, EyeIcon, PlayIcon, UploadIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { InvokeDialog } from "@/features/lambda/components/invoke-dialog/invoke-dialog";
import { UpdateCodeDialog } from "@/features/lambda/components/update-code-dialog/update-code-dialog";
import { encodeFunctionNameForRoute } from "@/features/lambda/lib/route-codec";
import type { AppDict } from "@/features/shared/i18n/get-dictionary";
import type { Locale } from "@/features/shared/i18n/locale";

type Props = {
  functionName: string;
  dict: AppDict["lambda"]["rowActions"];
  invokeDialogDict: AppDict["lambda"]["invokeDialog"];
  updateCodeDialogDict: AppDict["lambda"]["updateCodeDialog"];
  copyButtonDict: AppDict["shared"]["copyButton"];
  localePrefix: string;
  locale: Locale;
  closeLabel: string;
};

export function FunctionRowActions({
  functionName,
  dict,
  invokeDialogDict,
  updateCodeDialogDict,
  copyButtonDict,
  localePrefix,
  locale,
  closeLabel,
}: Props) {
  const [invokeOpen, setInvokeOpen] = useState(false);
  const [updateCodeOpen, setUpdateCodeOpen] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              variant="ghost"
              size="icon-sm"
              className="min-h-11 min-w-11 shrink-0 md:min-h-9 md:min-w-9"
              aria-label={dict.actions}
            />
          }
        >
          <MoreHorizontalIcon />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            render={
              <Link href={`${localePrefix}/lambda/${encodeFunctionNameForRoute(functionName)}`} />
            }
          >
            <EyeIcon />
            {dict.viewDetail}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setInvokeOpen(true)}>
            <PlayIcon />
            {dict.invoke}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setUpdateCodeOpen(true)}>
            <UploadIcon />
            {dict.updateCode}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <InvokeDialog
        functionName={functionName}
        dict={invokeDialogDict}
        copyButtonDict={copyButtonDict}
        locale={locale}
        open={invokeOpen}
        onOpenChange={setInvokeOpen}
        closeLabel={closeLabel}
      />
      <UpdateCodeDialog
        functionName={functionName}
        dict={updateCodeDialogDict}
        open={updateCodeOpen}
        onOpenChange={setUpdateCodeOpen}
       closeLabel={closeLabel}/>
    </>
  );
}
