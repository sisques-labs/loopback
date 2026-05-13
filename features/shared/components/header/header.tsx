import type { ReactNode } from "react";

type Props = {
  leftSlot?: ReactNode;
  rightSlot?: ReactNode;
};

export function Header({ leftSlot, rightSlot }: Props) {
  return (
    <header className="flex h-14 items-center gap-2 border-b bg-background px-4 md:px-6">
      {leftSlot}
      <div className="min-w-0 flex-1" aria-hidden />
      {rightSlot}
    </header>
  );
}
