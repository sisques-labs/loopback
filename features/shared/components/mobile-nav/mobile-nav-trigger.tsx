"use client";

import { MenuIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMobileNavStore } from "@/features/shared/stores/mobile-nav-store";

type Props = {
  label: string;
};

export function MobileNavTrigger({ label }: Props) {
  const open = useMobileNavStore((s) => s.open);
  const setOpen = useMobileNavStore((s) => s.setOpen);

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      className="min-h-11 min-w-11 shrink-0 md:hidden"
      aria-label={label}
      aria-expanded={open}
      aria-controls="mobile-nav-drawer"
      onClick={() => setOpen(true)}
    >
      <MenuIcon />
    </Button>
  );
}
