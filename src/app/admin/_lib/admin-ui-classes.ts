/**
 * Clases compartidas para el panel admin en light y dark (sin duplicar bloques largos en cada componente).
 */
export const adminChip = {
  emerald:
    "border border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-800/50 dark:bg-emerald-950/40 dark:text-emerald-200",
  red: "border border-red-200 bg-red-50 text-red-800 dark:border-red-800/50 dark:bg-red-950/40 dark:text-red-200",
  amber:
    "border border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-800/50 dark:bg-amber-950/40 dark:text-amber-200",
  sky: "border border-sky-200 bg-sky-50 text-sky-900 dark:border-sky-800/50 dark:bg-sky-950/40 dark:text-sky-200",
  neutral:
    "border border-neutral-200 bg-neutral-100 text-neutral-700 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-200",
  inactive:
    "border border-neutral-300 bg-neutral-100 text-neutral-700 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-200",
  /** Fondos de estado / línea suave en tablas */
  surface: "border border-border bg-surface text-muted-foreground dark:border-white/10 dark:bg-neutral-900/30",
} as const;

export const adminAlert = {
  error:
    "border border-red-200 bg-red-50 text-red-700 dark:border-red-800/50 dark:bg-red-950/30 dark:text-red-200",
  success:
    "border border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-800/50 dark:bg-emerald-950/30 dark:text-emerald-200",
} as const;

/** Cabecera de tabla sticky (productos, etc.) */
export const adminTableTheadClass =
  "sticky top-0 z-[1] border-b border-border bg-card text-xs uppercase tracking-wide text-muted-foreground shadow-sm";
