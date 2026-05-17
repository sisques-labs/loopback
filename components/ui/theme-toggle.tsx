"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Monitor, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cycleTheme } from "@/lib/cycle-theme";

type ThemeToggleDict = {
  system: string;
  light: string;
  dark: string;
  toggleTheme: string;
};

type ThemeToggleProps = {
  dict: ThemeToggleDict;
};

export function ThemeToggle({ dict }: ThemeToggleProps) {
  const [mounted, setMounted] = useState(false);
  const { theme = "system", setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  function handleClick() {
    setTheme(cycleTheme(theme));
  }

  const IconComponent =
    theme === "light" ? Sun : theme === "dark" ? Moon : Monitor;

  const iconLabel =
    theme === "light"
      ? dict.light
      : theme === "dark"
        ? dict.dark
        : dict.system;

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      className="min-h-11 min-w-11 md:min-h-9 md:min-w-9 shrink-0"
      aria-label={dict.toggleTheme}
      data-theme={theme}
      onClick={handleClick}
    >
      <IconComponent aria-hidden="true" />
      <span className="sr-only">{iconLabel}</span>
    </Button>
  );
}
