"use client";

import { useState, useId } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { SettingsIcon, PaletteIcon } from "lucide-react";
import { services } from "@/lib/services-registry";
import { tools } from "@/lib/tools-registry";
import { usePaletteStore } from "@/features/shared/stores/use-palette-store";
import { cycleTheme } from "@/lib/cycle-theme";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

export type CommandPaletteDict = {
  title: string;
  placeholder: string;
  empty: string;
  close: string;
  groupServices: string;
  groupTools: string;
  groupActions: string;
  actionSettings: string;
  actionToggleTheme: string;
  ariaLabel: string;
};

export type CommandPaletteProps = {
  dict: CommandPaletteDict;
  localePrefix: string;
};

type PaletteItem = {
  id: string;
  label: string;
  group: "services" | "tools" | "actions";
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean | "true" | "false" }>;
  action: () => void;
};

function CommandPaletteInner({ dict, localePrefix }: CommandPaletteProps) {
  const router = useRouter();
  const { theme = "system", setTheme } = useTheme();
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(-1);
  const { setOpen } = usePaletteStore();
  const listboxId = useId();

  function close() {
    setOpen(false);
    setQuery("");
    setActiveIndex(-1);
  }

  // Build full item list
  const allItems: PaletteItem[] = [
    ...services.map((s) => ({
      id: `service-${s.slug}`,
      label: s.label,
      group: "services" as const,
      icon: s.icon,
      action: () => {
        close();
        router.push(`${localePrefix}${s.href}`);
      },
    })),
    ...tools.map((t) => ({
      id: `tool-${t.id}`,
      label: t.label,
      group: "tools" as const,
      icon: t.icon,
      action: () => {
        close();
        router.push(`${localePrefix}${t.href}`);
      },
    })),
    {
      id: "action-settings",
      label: dict.actionSettings,
      group: "actions" as const,
      icon: SettingsIcon,
      action: () => {
        close();
        router.push(`${localePrefix}/settings`);
      },
    },
    {
      id: "action-toggle-theme",
      label: dict.actionToggleTheme,
      group: "actions" as const,
      icon: PaletteIcon,
      action: () => {
        setTheme(cycleTheme(theme));
        close();
      },
    },
  ];

  // Filter by query
  const needle = query.trim().toLowerCase();
  const filtered = needle
    ? allItems.filter((item) => item.label.toLowerCase().includes(needle))
    : allItems;

  const servicesItems = filtered.filter((i) => i.group === "services");
  const toolsItems = filtered.filter((i) => i.group === "tools");
  const actionsItems = filtered.filter((i) => i.group === "actions");

  const hasResults = filtered.length > 0;

  // Clamp activeIndex to filtered length
  const clampedActive = activeIndex >= filtered.length ? filtered.length - 1 : activeIndex;

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) => Math.min(prev + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (clampedActive >= 0 && filtered[clampedActive]) {
        filtered[clampedActive].action();
      }
    }
  }

  function getItemId(index: number) {
    return `${listboxId}-item-${index}`;
  }

  const activeDescendant = clampedActive >= 0 ? getItemId(clampedActive) : undefined;

  function renderGroup(
    items: PaletteItem[],
    label: string,
    baseIndex: number
  ) {
    if (items.length === 0) return null;
    return (
      <div role="group" aria-label={label}>
        <div className="px-2 py-1 text-xs font-medium text-muted-foreground">{label}</div>
        {items.map((item, i) => {
          const globalIndex = baseIndex + i;
          const isActive = globalIndex === clampedActive;
          const Icon = item.icon;
          return (
            <div
              key={item.id}
              id={getItemId(globalIndex)}
              role="option"
              aria-selected={isActive}
              className={`flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors ${
                isActive ? "bg-accent text-accent-foreground" : "hover:bg-muted"
              }`}
              onClick={() => item.action()}
              onMouseEnter={() => setActiveIndex(globalIndex)}
            >
              <Icon className="size-4 shrink-0" aria-hidden={true} />
              <span>{item.label}</span>
            </div>
          );
        })}
      </div>
    );
  }

  const servicesStart = 0;
  const toolsStart = servicesItems.length;
  const actionsStart = servicesItems.length + toolsItems.length;

  return (
    <div
      className="flex flex-col gap-2"
    >
      <Input
        type="search"
        placeholder={dict.placeholder}
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setActiveIndex(-1);
        }}
        onKeyDown={handleKeyDown}
        aria-autocomplete="list"
        aria-controls={listboxId}
        aria-activedescendant={activeDescendant}
        autoFocus
        className="border-0 shadow-none focus-visible:ring-0 focus-visible:border-0"
      />
      <div
        id={listboxId}
        role="listbox"
        aria-label={dict.ariaLabel}
        className="flex flex-col gap-1 overflow-y-auto"
      >
        {!hasResults && (
          <p className="px-2 py-4 text-center text-sm text-muted-foreground">{dict.empty}</p>
        )}
        {renderGroup(servicesItems, dict.groupServices, servicesStart)}
        {renderGroup(toolsItems, dict.groupTools, toolsStart)}
        {renderGroup(actionsItems, dict.groupActions, actionsStart)}
      </div>
    </div>
  );
}

export function CommandPalette({ dict, localePrefix }: CommandPaletteProps) {
  const open = usePaletteStore((s) => s.open);
  const setOpen = usePaletteStore((s) => s.setOpen);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        closeLabel={dict.close}
        showCloseButton={false}
        className="top-[20%] max-w-lg translate-y-0 gap-0 overflow-hidden p-0"
        aria-label={dict.ariaLabel}
      >
        <DialogTitle className="sr-only">{dict.title}</DialogTitle>
        <CommandPaletteInner dict={dict} localePrefix={localePrefix} />
      </DialogContent>
    </Dialog>
  );
}
