"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

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

export function AdminSidebar() {
  const pathname = usePathname() ?? "";

  return (
    <aside
      className="flex w-full shrink-0 flex-col border-b border-border bg-surface/50 md:sticky md:top-0 md:h-screen md:w-56 md:border-b-0 md:border-r"
      aria-label="Navegación del panel"
    >
      <div className="border-b border-border px-4 py-4">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Panel
        </p>
        <p className="mt-0.5 text-sm font-semibold leading-tight text-foreground">
          Tu Casaca Deportiva
        </p>
        <p className="text-xs text-muted-foreground">Administración</p>
      </div>
      <nav className="flex flex-1 flex-col gap-1 p-3">
        <p className="px-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
          Menú
        </p>
        <ul className="flex flex-col gap-0.5">
          {PRIMARY_NAV.map((item) => {
            const active = navItemIsActive(item.href, pathname);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`block rounded-md px-2 py-2 text-sm font-medium transition-colors ${
                    active
                      ? "bg-foreground/5 text-foreground"
                      : "text-muted-foreground hover:bg-foreground/5 hover:text-foreground"
                  }`}
                  aria-current={active ? "page" : undefined}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
        <p className="mt-4 px-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
          Próximamente
        </p>
        <ul className="flex flex-col gap-0.5" aria-hidden>
          {FUTURE_PLACEHOLDERS.map((label) => (
            <li key={label}>
              <span
                className="block cursor-not-allowed rounded-md px-2 py-2 text-sm text-muted-foreground/50"
                title="Próximamente"
              >
                {label}
              </span>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
