export const STOREFRONT_THEME_STORAGE_KEY = "tcds-theme";

export type StorefrontTheme = "light" | "dark";

export function parseStorefrontTheme(value: string | null): StorefrontTheme {
  return value === "light" ? "light" : "dark";
}
