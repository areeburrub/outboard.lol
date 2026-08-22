"use client";

import { MoonIcon, SunIcon } from "@phosphor-icons/react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";

export function ModeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && resolvedTheme === "dark";

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className="relative size-10 rounded-full text-ob-mute hover:bg-ob-surface hover:text-ob-ink"
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      onClick={() => setTheme(isDark ? "light" : "dark")}
    >
      <SunIcon
        weight="bold"
        className="size-5 scale-100 rotate-0 transition-transform dark:scale-0 dark:-rotate-90"
      />
      <MoonIcon
        weight="bold"
        className="absolute size-5 scale-0 rotate-90 transition-transform dark:scale-100 dark:rotate-0"
      />
    </Button>
  );
}
