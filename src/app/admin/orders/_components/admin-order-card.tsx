import Link from "next/link";
import type { Database } from "@/lib/supabase/database.types";
import { adminChip } from "@/app/admin/_lib/admin-ui-classes";
import {
  adminPaymentStatusLabel,
  formatOrderCreatedAtEsUy,
  getAdminOrderAttention,
  orderFulfillmentFlags,
  orderHasCustomizationLine,
} from "@/app/admin/orders/_lib/admin-order-helpers";
import {
  fulfillmentPromisedHabilesRangeSuffix,
  fulfillmentShortLabel,
} from "@/modules/orders/application/fulfillment-presentation";
import { customizationDisplayLine } from "@/modules/orders/application/order-presentation";

type OrderRow = Database["public"]["Tables"]["orders"]["Row"];
type OrderItemRow = Database["public"]["Tables"]["order_items"]["Row"];
type HistoryRow = Database["public"]["Tables"]["order_status_history"]["Row"];

type AdminOrderCardProps = {
  order: OrderRow;
  items: OrderItemRow[];
  history: HistoryRow[];
};

function paymentChipClass(status: OrderRow["payment_status"]): string {
  switch (status) {
    case "paid":
      return adminChip.emerald;
    case "failed":
      return adminChip.red;
    case "pending":
      return adminChip.sky;
    case "awaiting_payment":
      return adminChip.neutral;
  }
}

function operationalLabel(
  order: OrderRow
): { text: string; className: string } {
  if (order.payment_status === "failed") {
    return {
      text: "Operación: no aplica (pago fallido)",
      className: adminChip.inactive,
    };
  }
  if (order.operational_status === null) {
    return { text: "Estado operativo: sin asignar", className: adminChip.surface };
  }
  const text: Record<NonNullable<OrderRow["operational_status"]>, string> = {
    paid: "Operativo: pagado",
    preparing: "En preparación",
    ready: "Listo",
    shipped: "Enviado",
    delivered: "Entregado",
    cancelled: "Cancelado",
  };
  return { text: text[order.operational_status], className: adminChip.neutral };
}

function fulfillmentChipClass(
  snapshot: OrderItemRow["fulfillment_snapshot"]
): string {
  switch (snapshot) {
    case "express":
      return adminChip.emerald;
    case "made_to_order":
      return adminChip.sky;
    case "unavailable":
      return adminChip.surface;
  }
}

function formatHistoryDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString("es-UY", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

function AttentionBlock({ order }: { order: OrderRow }) {
  const attention = getAdminOrderAttention(order);
  if (attention.kind === "stock_ok") {
    return (
      <div
        className={`rounded-md px-3 py-2.5 text-xs leading-snug sm:text-sm ${attention.className}`}
        role="status"
      >
        <p className="font-medium">{attention.body}</p>
        <p className="mt-0.5 opacity-90 tabular-nums">Registrado: {attention.atLabel}</p>
      </div>
    );
  }
  return (
    <div
      className={`rounded-md px-3 py-2.5 text-xs leading-snug sm:text-sm ${attention.className}`}
      role="alert"
    >
      <p className="font-medium">{attention.body}</p>
    </div>
  );
}

function stockStatusChip(order: OrderRow): { label: string; className: string } | null {
  if (order.payment_status !== "paid") {
    return null;
  }
  if (order.stock_discounted_at === null) {
    return {
      label: "Stock: pendiente",
      className: adminChip.sky,
    };
  }
  return {
    label: "Stock: descontado",
    className: adminChip.emerald,
  };
}

export function AdminOrderCard({ order, items, history }: AdminOrderCardProps) {
  const { hasExpress, hasMadeToOrder } = orderFulfillmentFlags(items);
  const operational = operationalLabel(order);
  const stockChip = stockStatusChip(order);
  const hasCustomization = orderHasCustomizationLine(items);

  return (
    <article className="tcds-card overflow-hidden text-sm">
      <div className="flex flex-col gap-3 border-b border-border bg-surface/40 px-4 py-3.5 sm:px-5">
        <div className="flex flex-wrap items-start justify-between gap-x-2 gap-y-1">
          <div>
            <p className="font-mono text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              Ref. pública
            </p>
            <p className="font-mono text-lg font-semibold tracking-tight text-foreground sm:text-xl">
              {order.public_reference}
            </p>
          </div>
          <p className="text-right text-xs text-muted-foreground sm:pt-0.5">
            <span className="block font-medium uppercase tracking-wide text-muted-foreground/90">
              Creado
            </span>
            <span className="tabular-nums text-foreground/90">
              {formatOrderCreatedAtEsUy(order.created_at)}
            </span>
          </p>
        </div>

        <div className="grid gap-2 sm:grid-cols-2 sm:gap-4">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              Cliente
            </p>
            <p className="truncate text-base font-semibold text-foreground">
              {order.customer_full_name}
            </p>
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              Teléfono
            </p>
            <a
              href={`tel:${order.customer_phone.replace(/\s+/g, "")}`}
              className="inline-block text-base font-semibold text-sky-700 underline-offset-2 hover:underline dark:text-sky-300"
            >
              {order.customer_phone}
            </a>
          </div>
        </div>

        <div className="flex flex-wrap items-baseline justify-between gap-2 border-t border-border/60 pt-2 dark:border-white/10">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Total</p>
          <p className="text-lg font-bold tabular-nums text-foreground">$ {order.total}</p>
        </div>

        <div className="flex flex-wrap gap-1.5">
          <span
            className={`inline-flex max-w-full rounded-md px-2 py-1 text-[11px] font-medium sm:text-xs ${paymentChipClass(order.payment_status)}`}
          >
            {adminPaymentStatusLabel(order.payment_status)}
          </span>
          <span
            className={`inline-flex max-w-full rounded-md px-2 py-1 text-[11px] font-medium sm:text-xs ${operational.className}`}
          >
            {operational.text}
          </span>
          {stockChip ? (
            <span
              className={`inline-flex rounded-md px-2 py-1 text-[11px] font-medium sm:text-xs ${stockChip.className}`}
            >
              {stockChip.label}
            </span>
          ) : null}
          {hasMadeToOrder ? (
            <span
              className={`inline-flex rounded-md px-2 py-1 text-[11px] font-medium sm:text-xs ${adminChip.sky}`}
            >
              Incluye encargo
            </span>
          ) : null}
          {hasExpress ? (
            <span
              className={`inline-flex rounded-md px-2 py-1 text-[11px] font-medium sm:text-xs ${adminChip.emerald}`}
            >
              Incluye express
            </span>
          ) : null}
          {hasCustomization ? (
            <span
              className={`inline-flex rounded-md px-2 py-1 text-[11px] font-medium sm:text-xs ${adminChip.sky}`}
            >
              Incluye personalización
            </span>
          ) : null}
        </div>
      </div>

      <div className="space-y-3 px-4 py-3">
        <AttentionBlock order={order} />

        <form
          action="/api/admin/orders/status"
          method="post"
          className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-end"
        >
          <input type="hidden" name="orderId" value={order.id} />
          <label className="flex min-w-48 flex-col gap-1 text-xs font-medium text-foreground">
            Estado operativo
            <select
              name="nextOperationalStatus"
              defaultValue={order.operational_status ?? ""}
              className="tcds-input w-full min-w-0 sm:w-auto sm:min-w-44"
            >
              <option value="" disabled>
                Seleccionar…
              </option>
              <option value="paid">Pagado (paid)</option>
              <option value="preparing">En preparación (preparing)</option>
              <option value="ready">Listo (ready)</option>
              <option value="shipped">Enviado (shipped)</option>
              <option value="delivered">Entregado (delivered)</option>
              <option value="cancelled">Cancelado (cancelled)</option>
            </select>
          </label>
          <button type="submit" className="tcds-btn-secondary w-fit shrink-0">
            Guardar estado
          </button>
        </form>

        <Link
          className="tcds-link inline-flex w-fit text-sm"
          href={`/orders/${order.public_reference}`}
        >
          Ver detalle público
        </Link>

        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Líneas del pedido ({items.length})
          </h3>
          <ul className="mt-2 divide-y divide-border overflow-hidden rounded-lg border border-border dark:divide-white/10 dark:border-white/10">
            {items.map((item) => {
              const customLine = customizationDisplayLine(
                item.customization_snapshot
              );
              return (
                <li key={item.id} className="bg-card/30 px-3 py-2.5 sm:px-3.5 sm:py-3">
                  <div className="flex flex-wrap items-start justify-between gap-x-2 gap-y-1">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium leading-snug text-foreground">
                        {item.title_snapshot}
                      </p>
                      <p className="mt-0.5 text-[11px] text-muted-foreground sm:text-xs">
                        Talle {item.size_snapshot}
                        {fulfillmentPromisedHabilesRangeSuffix(
                          item.promised_min_days,
                          item.promised_max_days
                        )}
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-wrap items-center justify-end gap-1.5">
                      <span className="tabular-nums text-xs font-medium text-muted-foreground">
                        ×{item.quantity}
                      </span>
                      <span
                        className={`inline-flex rounded px-1.5 py-0.5 text-[11px] font-medium ${fulfillmentChipClass(item.fulfillment_snapshot)}`}
                      >
                        {fulfillmentShortLabel(item.fulfillment_snapshot)}
                      </span>
                    </div>
                  </div>
                  {customLine ? (
                    <p className="mt-1.5 border-t border-dashed border-border/70 pt-1.5 text-[11px] font-medium text-sky-800 dark:border-white/10 dark:text-sky-200 sm:text-xs">
                      {customLine}
                    </p>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </div>

        <details className="rounded-md border border-border bg-surface/30 px-3 py-2 dark:border-white/10">
          <summary className="cursor-pointer text-xs font-medium text-foreground">
            Historial operativo ({history.length})
          </summary>
          {history.length === 0 ? (
            <p className="mt-2 text-xs text-muted-foreground">Sin eventos registrados.</p>
          ) : (
            <ul className="mt-2 max-h-40 space-y-1.5 overflow-y-auto text-xs text-muted-foreground">
              {history.map((event) => (
                <li
                  key={event.id}
                  className="border-l-2 border-sky-200 pl-2 dark:border-sky-800"
                >
                  <span className="font-medium text-foreground">
                    {(event.previous_status ?? "-") + " → " + event.new_status}
                  </span>
                  <span className="ml-1 text-muted-foreground">
                    {formatHistoryDate(event.changed_at)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </details>
      </div>
    </article>
  );
}
