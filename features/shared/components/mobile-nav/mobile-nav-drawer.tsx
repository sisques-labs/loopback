"use client";

import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NavLinks } from "./nav-links";
import { useMobileNavStore } from "@/features/shared/stores/mobile-nav-store";
import type { AppDict } from "@/features/shared/i18n/get-dictionary";

type Props = {
  sidebarDict: AppDict["shared"]["sidebar"];
  headerDict: AppDict["shared"]["header"];
  localePrefix: string;
};

export function MobileNavDrawer({ sidebarDict, headerDict, localePrefix }: Props) {
  const open = useMobileNavStore((s) => s.open);
  const setOpen = useMobileNavStore((s) => s.setOpen);

  return (
    <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Backdrop className="fixed inset-0 z-50 bg-black/50 duration-150 data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0" />
        <DialogPrimitive.Popup
          id="mobile-nav-drawer"
          className="fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-sidebar px-4 py-6 shadow-xl duration-200 data-open:animate-in data-open:slide-in-from-left data-closed:animate-out data-closed:slide-out-to-left outline-none"
        >
          <div className="mb-4 flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              {sidebarDict.services}
            </span>
            <DialogPrimitive.Close
              render={
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="min-h-11 min-w-11 shrink-0 md:min-h-9 md:min-w-9"
                  aria-label={headerDict.closeMenu}
                />
              }
            >
              <XIcon className="size-4" />
            </DialogPrimitive.Close>
          </div>
          <NavLinks
            localePrefix={localePrefix}
            onNavigate={() => setOpen(false)}
          />
        </DialogPrimitive.Popup>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
