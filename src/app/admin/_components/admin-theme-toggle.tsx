"use client";

import { StorefrontThemeToggle } from "@/components/storefront/storefront-theme-toggle";

/**
 * Mismo control que el header público: `tcds-theme` en localStorage, clase en `<html>`.
 */
export function AdminThemeToggle() {
  return <StorefrontThemeToggle />;
}
