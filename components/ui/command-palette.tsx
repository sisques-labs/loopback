"use client";

import { useState, useEffect, useId } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { SettingsIcon, PaletteIcon, BoxIcon, DatabaseZapIcon } from "lucide-react";
import { services } from "@/lib/services-registry";
import { tools } from "@/lib/tools-registry";
import { usePaletteStore } from "@/features/shared/stores/use-palette-store";
import { cycleTheme } from "@/lib/cycle-theme";
import { searchResourcesAction } from "@/features/shared/use-cases/search-resources/search-resources";
import type { ResourceItem } from "@/features/shared/types/resource-item";
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
  groupResources: string;
  searchLoading: string;
  searchEmpty: string;
  actionSettings: string;
  actionToggleTheme: string;
  actionLoadDemoData: string;
  actionResetEnvironment: string;
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

  // Resource state — fetch-once-on-open, client-side filter
  const [resourceItems, setResourceItems] = useState<ResourceItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch all resources once when palette mounts (on open)
  useEffect(() => {
    let cancelled = false;
    searchResourcesAction(localePrefix).then((items) => {
      if (!cancelled) {
        setResourceItems(items);
        setLoading(false);
      }
    }).catch(() => {
      if (!cancelled) {
        setResourceItems([]);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [localePrefix]);

  function close() {
    setOpen(false);
    setQuery("");
    setActiveIndex(-1);
  }

  // Build full static item list (services, tools, actions)
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
    {
      id: "action-load-demo-data",
      label: dict.actionLoadDemoData,
      group: "actions" as const,
      icon: DatabaseZapIcon,
      action: () => {
        close();
        router.push(`${localePrefix}/seed`);
      },
    },
    {
      id: "action-reset-environment",
      label: dict.actionResetEnvironment,
      group: "actions" as const,
      icon: DatabaseZapIcon,
      action: () => {
        close();
        router.push(`${localePrefix}/seed#reset`);
      },
    },
  ];

  // Filter static items by query
  const needle = query.trim().toLowerCase();
  const filtered = needle
    ? allItems.filter((item) => item.label.toLowerCase().includes(needle))
    : allItems;

  const servicesItems = filtered.filter((i) => i.group === "services");
  const toolsItems = filtered.filter((i) => i.group === "tools");
  const actionsItems = filtered.filter((i) => i.group === "actions");

  // Filter resource items client-side (cached snapshot; no per-keystroke server calls)
  const filteredResourceItems = !needle
    ? resourceItems
    : resourceItems.filter(
        (r) =>
          r.label.toLowerCase().includes(needle) ||
          r.id.toLowerCase().includes(needle),
      );

  // Resources group base index: LAST — after services + tools + actions
  const servicesStart = 0;
  const toolsStart = servicesItems.length;
  const actionsStart = servicesItems.length + toolsItems.length;
  const resourcesStart = servicesItems.length + toolsItems.length + actionsItems.length;

  // Combined filtered list for keyboard navigation
  // Resources appended LAST — existing indices unchanged
  const allFiltered = [...filtered, ...filteredResourceItems.map((r) => ({
    id: r.id,
    label: r.label,
    group: "resources" as const,
    // BoxIcon as a generic resource icon
    icon: BoxIcon as React.ComponentType<{ className?: string; "aria-hidden"?: boolean | "true" | "false" }>,
    action: () => {
      close();
      router.push(r.href);
    },
  }))];

  const hasResults = allFiltered.length > 0 || loading;

  // Clamp activeIndex to allFiltered length
  const clampedActive = activeIndex >= allFiltered.length ? allFiltered.length - 1 : activeIndex;

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) => Math.min(prev + 1, allFiltered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (clampedActive >= 0 && allFiltered[clampedActive]) {
        allFiltered[clampedActive].action();
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

  function renderResourceGroup() {
    // Show skeleton while loading
    if (loading) {
      return (
        <div role="group" aria-label={dict.groupResources}>
          <div className="px-2 py-1 text-xs font-medium text-muted-foreground">
            {dict.groupResources}
          </div>
          <div className="px-2 py-2 text-sm text-muted-foreground">
            {dict.searchLoading}
          </div>
        </div>
      );
    }

    // Hide when empty (not loading)
    if (filteredResourceItems.length === 0) return null;

    return (
      <div role="group" aria-label={dict.groupResources}>
        <div className="px-2 py-1 text-xs font-medium text-muted-foreground">
          {dict.groupResources}
        </div>
        {filteredResourceItems.map((item, i) => {
          const globalIndex = resourcesStart + i;
          const isActive = globalIndex === clampedActive;
          return (
            <div
              key={item.id}
              id={getItemId(globalIndex)}
              role="option"
              aria-selected={isActive}
              className={`flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors ${
                isActive ? "bg-accent text-accent-foreground" : "hover:bg-muted"
              }`}
              onClick={() => {
                close();
                router.push(item.href);
              }}
              onMouseEnter={() => setActiveIndex(globalIndex)}
            >
              <BoxIcon className="size-4 shrink-0" aria-hidden={true} />
              <span>{item.label}</span>
            </div>
          );
        })}
      </div>
    );
  }

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
        {renderResourceGroup()}
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
        <CommandPaletteInner key={localePrefix} dict={dict} localePrefix={localePrefix} />
      </DialogContent>
    </Dialog>
  );
}
