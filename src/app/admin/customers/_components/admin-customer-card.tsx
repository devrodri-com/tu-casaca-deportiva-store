import Link from "next/link";
import {
  adminPaymentStatusLabel,
  formatOrderCreatedAtEsUy,
} from "@/app/admin/orders/_lib/admin-order-helpers";
import type { AdminCustomerSummary } from "@/modules/orders/application/get-admin-customers";
import { formatOrderMoneyUruguay } from "@/modules/orders/application/order-presentation";

type AdminCustomerCardProps = {
  customer: AdminCustomerSummary;
};

function adminOrdersHrefForGrupo(groupKey: string): string {
  return `/admin/orders?${new URLSearchParams({ grupo: groupKey }).toString()}`;
}

export function AdminCustomerCard({ customer }: AdminCustomerCardProps) {
  const ordersAdminHref = adminOrdersHrefForGrupo(customer.groupKey);
  const phoneDigits = customer.phoneDisplay?.replace(/\s+/g, "") ?? "";

  return (
    <article className="tcds-card overflow-hidden text-sm">
      <div className="flex flex-col gap-3 border-b border-border bg-surface/40 px-4 py-3.5 sm:px-5">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <h2 className="text-lg font-semibold leading-snug text-foreground">
            {customer.displayName}
          </h2>
          <Link
            href={ordersAdminHref}
            className="tcds-btn-secondary inline-flex min-h-9 shrink-0 items-center justify-center px-3 py-1.5 text-xs font-medium sm:text-sm"
          >
            Ver pedidos en admin
          </Link>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              Teléfono
            </p>
            {customer.phoneDisplay ? (
              phoneDigits.length > 0 ? (
                <a
                  href={`tel:${phoneDigits}`}
                  className="mt-0.5 inline-block text-base font-semibold text-sky-700 underline-offset-2 hover:underline dark:text-sky-300"
                >
                  {customer.phoneDisplay}
                </a>
              ) : (
                <span className="mt-0.5 block text-base font-semibold text-foreground">
                  {customer.phoneDisplay}
                </span>
              )
            ) : (
              <p className="mt-0.5 text-sm text-muted-foreground">Sin teléfono</p>
            )}
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              Email
            </p>
            {customer.emailTrimmed ? (
              <a
                href={`mailto:${customer.emailTrimmed}`}
                className="mt-0.5 block truncate text-sm font-medium text-sky-700 underline-offset-2 hover:underline dark:text-sky-300"
              >
                {customer.emailTrimmed}
              </a>
            ) : (
              <p className="mt-0.5 text-sm italic text-muted-foreground">Sin email</p>
            )}
          </div>
        </div>

        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            Última dirección conocida
          </p>
          <p className="mt-0.5 text-sm leading-relaxed text-foreground">
            {customer.lastKnownAddressLine.length > 0
              ? customer.lastKnownAddressLine
              : "—"}
          </p>
        </div>
      </div>

      <div className="grid gap-3 px-4 py-3.5 sm:grid-cols-2 sm:px-5">
        <div className="rounded-lg border border-border bg-card/40 px-3 py-2 dark:border-white/10">
          <p className="text-[11px] font-medium text-muted-foreground">Pedidos totales</p>
          <p className="text-xl font-bold tabular-nums text-foreground">
            {customer.totalOrderCount}
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card/40 px-3 py-2 dark:border-white/10">
          <p className="text-[11px] font-medium text-muted-foreground">Pedidos pagados</p>
          <p className="text-xl font-bold tabular-nums text-foreground">
            {customer.paidOrderCount}
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card/40 px-3 py-2 sm:col-span-2 dark:border-white/10">
          <p className="text-[11px] font-medium text-muted-foreground">Total pagado acumulado</p>
          <p className="text-xl font-bold tabular-nums text-emerald-800 dark:text-emerald-200">
            {formatOrderMoneyUruguay(customer.paidTotalAmount)}
          </p>
        </div>
      </div>

      <div className="border-t border-border px-4 py-3 sm:px-5 dark:border-white/10">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          Último pedido
        </p>
        <p className="mt-1 text-sm text-foreground">
          <span className="tabular-nums text-muted-foreground">
            {formatOrderCreatedAtEsUy(customer.lastOrderCreatedAtIso)}
          </span>
          <span className="mx-1.5 text-muted-foreground">·</span>
          <span className="font-mono text-sm font-medium text-foreground">
            {customer.lastOrderPublicReference}
          </span>
        </p>
        <p className="mt-2 text-xs text-muted-foreground">
          Vista pública:{" "}
          <Link
            className="font-medium text-sky-700 underline-offset-2 hover:underline dark:text-sky-300"
            href={`/orders/${customer.lastOrderPublicReference}`}
          >
            Abrir último pedido
          </Link>
        </p>
      </div>

      <div className="border-t border-border px-4 py-3 sm:px-5 dark:border-white/10">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          Referencias recientes
        </p>
        <ul className="mt-2 flex flex-col gap-2">
          {customer.recentOrdersBrief.map((row) => (
            <li
              key={row.publicReference}
              className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-border/80 bg-surface/30 px-2.5 py-1.5 dark:border-white/10"
            >
              <Link
                href={`/orders/${row.publicReference}`}
                className="font-mono text-xs font-medium text-sky-700 hover:underline dark:text-sky-300"
              >
                {row.publicReference}
              </Link>
              <span className="text-[11px] text-muted-foreground">
                {adminPaymentStatusLabel(row.paymentStatus)}
              </span>
            </li>
          ))}
        </ul>
        {customer.relatedPublicReferencesDesc.length > 5 ? (
          <p className="mt-2 text-xs text-muted-foreground">
            +{customer.relatedPublicReferencesDesc.length - 5} pedido
            {customer.relatedPublicReferencesDesc.length - 5 === 1 ? "" : "s"} más en{" "}
            <Link
              href={ordersAdminHref}
              className="font-medium text-sky-700 underline-offset-2 hover:underline dark:text-sky-300"
            >
              Ver todos en admin
            </Link>
          </p>
        ) : null}
      </div>
    </article>
  );
}
