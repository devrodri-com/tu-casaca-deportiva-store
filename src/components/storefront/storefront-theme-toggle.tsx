"use client";

import { FaMoon, FaSun } from "react-icons/fa";
import { useStorefrontTheme } from "./use-storefront-theme";

export function StorefrontThemeToggle() {
  const { theme, toggle } = useStorefrontTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
      aria-pressed={isDark}
      className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-zinc-300 text-zinc-700 transition hover:bg-zinc-100 dark:border-white/20 dark:text-neutral-200 dark:hover:bg-white/10"
    >
      {isDark ? (
        <FaSun className="h-4 w-4 text-sky-300" aria-hidden />
      ) : (
        <FaMoon className="h-4 w-4 text-sky-700" aria-hidden />
      )}
    </button>
  );
}
