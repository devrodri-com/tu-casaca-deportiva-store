"use client";

import { useCallback, useSyncExternalStore } from "react";
import {
  STOREFRONT_THEME_STORAGE_KEY,
  type StorefrontTheme,
} from "@/lib/storefront-theme";

function getDocumentTheme(): StorefrontTheme {
  if (typeof document === "undefined") {
    return "dark";
  }
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

function subscribe(onChange: () => void): () => void {
  const handler = (): void => {
    onChange();
  };
  window.addEventListener("tcds-theme-change", handler);
  return () => window.removeEventListener("tcds-theme-change", handler);
}

export function useStorefrontTheme(): {
  theme: StorefrontTheme;
  setTheme: (theme: StorefrontTheme) => void;
  toggle: () => void;
} {
  const theme = useSyncExternalStore<StorefrontTheme>(
    subscribe,
    getDocumentTheme,
    () => "dark"
  );

  const setTheme = useCallback((next: StorefrontTheme) => {
    const root = document.documentElement;
    if (next === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    try {
      localStorage.setItem(STOREFRONT_THEME_STORAGE_KEY, next);
    } catch {
      /* ignore quota / private mode */
    }
    window.dispatchEvent(new Event("tcds-theme-change"));
  }, []);

  const toggle = useCallback(() => {
    setTheme(theme === "dark" ? "light" : "dark");
  }, [theme, setTheme]);

  return { theme, setTheme, toggle };
}
