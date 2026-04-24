"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AdminThemeToggle } from "./admin-theme-toggle";

const PRIMARY_NAV: readonly { href: string; label: string }[] = [
  { href: "/admin", label: "Inicio" },
  { href: "/admin/products", label: "Productos" },
  { href: "/admin/orders", label: "Pedidos" },
] as const;

const FUTURE_PLACEHOLDERS = ["Clientes", "Historial", "Usuarios"] as const;

function navItemIsActive(href: string, pathname: string): boolean {
  if (href === "/admin") {
    return pathname === "/admin" || pathname === "/admin/";
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

type AdminNavPanelProps = {
  /** Llamar al elegir un enlace (p. ej. cerrar drawer móvil). */
  onNavigate?: () => void;
  /** Clase del contenedor interno (p. ej. ancho fijo en drawer). */
  className?: string;
  /**
   * En mobile el toggle suele mostrarse en la barra superior; en el drawer se oculta
   * la fila "Tema" para no duplicar.
   */
  showThemeInPanel?: boolean;
};

export function AdminNavPanel({
  onNavigate,
  className = "",
  showThemeInPanel = true,
}: AdminNavPanelProps) {
  const pathname = usePathname() ?? "";

  function handleLinkClick(): void {
    onNavigate?.();
  }

  return (
    <div className={`flex h-full min-h-0 min-w-0 flex-col ${className}`.trim()}>
      <div className="shrink-0 border-b border-border px-4 py-4">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-sky-600 text-xs font-bold text-white">
            TCD
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold leading-tight text-foreground">
              Tu Casaca Deportiva
            </p>
            <p className="text-[11px] text-muted-foreground">Administración</p>
          </div>
        </div>
        {showThemeInPanel ? (
          <div className="mt-3 flex items-center justify-between gap-2 border-t border-border pt-3 dark:border-white/10">
            <span className="text-xs font-medium text-muted-foreground">Tema</span>
            <AdminThemeToggle />
          </div>
        ) : null}
      </div>
      <nav
        className="flex min-h-0 flex-1 flex-col gap-0.5 overflow-y-auto p-2.5"
        aria-label="Navegación del panel"
      >
        <p className="px-2.5 pb-1 pt-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Menú
        </p>
        <ul className="flex flex-col gap-0.5">
          {PRIMARY_NAV.map((item) => {
            const active = navItemIsActive(item.href, pathname);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={handleLinkClick}
                  className={`block rounded-md border-l-2 py-2 pl-2.5 pr-2 text-sm font-medium transition-colors ${
                    active
                      ? "border-sky-600 bg-sky-50 text-foreground dark:border-sky-500 dark:bg-sky-950/50 dark:text-sky-100"
                      : "border-transparent text-muted-foreground hover:bg-surface hover:text-foreground dark:hover:bg-white/5"
                  }`}
                  aria-current={active ? "page" : undefined}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
        <p className="mt-4 px-2.5 pb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Próximamente
        </p>
        <ul className="flex flex-col gap-0.5" aria-label="Funciones no disponibles">
          {FUTURE_PLACEHOLDERS.map((label) => (
            <li key={label}>
              <span
                className="block cursor-not-allowed rounded-md px-2.5 py-2 text-sm text-muted-foreground/55"
                title="Próximamente"
              >
                {label}
              </span>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
