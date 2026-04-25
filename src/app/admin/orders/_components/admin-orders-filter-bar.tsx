import Link from "next/link";
import type {
  AdminOrdersFilter,
  AdminOrdersFilterCounts,
} from "@/app/admin/orders/_lib/admin-order-helpers";

type AdminOrdersFilterBarProps = {
  active: AdminOrdersFilter;
  counts: AdminOrdersFilterCounts;
  /** Si viene de Clientes admin: conservar al cambiar filtro de pago. */
  customerGrupo?: string | null;
};

const pillInactive =
  "border-border bg-card text-muted-foreground hover:border-sky-400/35 hover:text-foreground dark:border-white/10 dark:hover:border-sky-500/35";

const pillActive =
  "border-sky-500/70 bg-sky-500/15 text-sky-950 ring-1 ring-sky-400/30 dark:border-sky-500 dark:bg-sky-950/45 dark:text-sky-50 dark:ring-sky-400/25";

function hrefFor(
  filter: AdminOrdersFilter,
  customerGrupo: string | null | undefined
): string {
  const params = new URLSearchParams();
  if (filter !== "all") {
    params.set("filter", filter);
  }
  if (customerGrupo && customerGrupo.length > 0) {
    params.set("grupo", customerGrupo);
  }
  const q = params.toString();
  return q.length > 0 ? `/admin/orders?${q}` : "/admin/orders";
}

type PillDef = { id: AdminOrdersFilter; label: string };

const PILLS: PillDef[] = [
  { id: "all", label: "Todos" },
  { id: "no_payment", label: "Sin pago" },
  { id: "stale_payment", label: "Posible abandono" },
  { id: "pending", label: "Pendientes" },
  { id: "paid", label: "Pagados" },
  { id: "failed", label: "Fallidos" },
  { id: "stock_pending", label: "Stock pendiente" },
];

function countFor(filter: AdminOrdersFilter, counts: AdminOrdersFilterCounts): number {
  switch (filter) {
    case "all":
      return counts.all;
    case "no_payment":
      return counts.no_payment;
    case "stale_payment":
      return counts.stale_payment;
    case "pending":
      return counts.pending;
    case "paid":
      return counts.paid;
    case "failed":
      return counts.failed;
    case "stock_pending":
      return counts.stock_pending;
  }
}

export function AdminOrdersFilterBar({
  active,
  counts,
  customerGrupo,
}: AdminOrdersFilterBarProps) {
  return (
    <nav
      className="flex flex-wrap gap-2"
      aria-label="Filtrar pedidos por estado"
    >
      {PILLS.map((pill) => {
        const isActive = active === pill.id;
        const n = countFor(pill.id, counts);
        return (
          <Link
            key={pill.id}
            href={hrefFor(pill.id, customerGrupo)}
            scroll={false}
            className={`inline-flex min-h-9 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition sm:text-[13px] ${
              isActive ? pillActive : pillInactive
            }`}
            aria-current={isActive ? "page" : undefined}
          >
            <span>{pill.label}</span>
            <span className="tabular-nums opacity-80">({n})</span>
          </Link>
        );
      })}
    </nav>
  );
}
