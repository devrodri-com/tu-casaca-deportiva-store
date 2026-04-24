import { AdminNavPanel } from "./admin-nav-panel";

/**
 * Barra lateral fija (solo `md+`). En mobile el menú va en `AdminMobileNav` (drawer).
 */
export function AdminSidebar() {
  return (
    <aside
      className="hidden w-56 shrink-0 flex-col border-b-0 border-r border-border bg-card shadow-sm md:sticky md:top-0 md:flex md:h-screen"
      aria-label="Navegación del panel"
    >
      <AdminNavPanel />
    </aside>
  );
}
