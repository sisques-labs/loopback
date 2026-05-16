import type { ReactNode } from "react";

type Props = {
  leftSlot?: ReactNode;
  centerSlot?: ReactNode;
  rightSlot?: ReactNode;
};

export function Header({ leftSlot, centerSlot, rightSlot }: Props) {
  return (
    <header className="flex h-14 items-center gap-2 border-b bg-background px-4 md:px-6">
      {leftSlot}
      <div className="flex min-w-0 flex-1 items-center">{centerSlot}</div>
      {rightSlot}
    </header>
  );
}
