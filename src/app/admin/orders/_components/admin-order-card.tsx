import Link from "next/link";
import type { Database } from "@/lib/supabase/database.types";
import { adminChip } from "@/app/admin/_lib/admin-ui-classes";

type OrderRow = Database["public"]["Tables"]["orders"]["Row"];
type OrderItemRow = Database["public"]["Tables"]["order_items"]["Row"];
type HistoryRow = Database["public"]["Tables"]["order_status_history"]["Row"];

type AdminOrderCardProps = {
  order: OrderRow;
  items: OrderItemRow[];
  history: HistoryRow[];
};

function paymentLabel(status: OrderRow["payment_status"]): string {
  switch (status) {
    case "awaiting_payment":
      return "Esperando pago";
    case "pending":
      return "Pago pendiente";
    case "paid":
      return "Pagado";
    case "failed":
      return "Pago fallido";
  }
}

function paymentChipClass(status: OrderRow["payment_status"]): string {
  switch (status) {
    case "paid":
      return adminChip.emerald;
    case "failed":
      return adminChip.red;
    case "pending":
    case "awaiting_payment":
      return adminChip.amber;
  }
}

function operationalLabel(status: OrderRow["operational_status"]): string {
  if (status === null) {
    return "Sin estado operativo";
  }
  switch (status) {
    case "paid":
      return "Pagado (operativo)";
    case "preparing":
      return "En preparación";
    case "ready":
      return "Listo";
    case "shipped":
      return "Enviado";
    case "delivered":
      return "Entregado";
    case "cancelled":
      return "Cancelado";
  }
}

function fulfillmentLabel(snapshot: OrderItemRow["fulfillment_snapshot"]): string {
  switch (snapshot) {
    case "express":
      return "Express";
    case "made_to_order":
      return "Encargo";
    case "unavailable":
      return "Sin stock";
  }
}

function fulfillmentChipClass(snapshot: OrderItemRow["fulfillment_snapshot"]): string {
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

export function AdminOrderCard({ order, items, history }: AdminOrderCardProps) {
  const stockLine =
    order.stock_discounted_at !== null
      ? `Stock descontado: ${formatHistoryDate(order.stock_discounted_at)}`
      : "Stock aún no descontado";

  return (
    <article className="tcds-card overflow-hidden text-sm">
      <div className="flex flex-col gap-3 border-b border-border bg-surface/40 px-4 py-3 md:flex-row md:flex-wrap md:items-center md:justify-between">
        <div className="min-w-0 space-y-1">
          <p className="font-mono text-xs font-medium text-muted-foreground">Ref. pública</p>
          <p className="font-mono text-base font-semibold tracking-tight text-foreground">
            {order.public_reference}
          </p>
          <p className="text-xs text-muted-foreground">
            {order.customer_full_name} · {order.customer_phone}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`inline-flex rounded-md px-2 py-1 text-xs font-medium ${paymentChipClass(order.payment_status)}`}
          >
            {paymentLabel(order.payment_status)}
          </span>
          <span className="inline-flex rounded-md border border-border bg-card px-2 py-1 text-xs font-medium text-foreground">
            {operationalLabel(order.operational_status)}
          </span>
          <span className="text-xs tabular-nums text-muted-foreground">Total ${order.total}</span>
        </div>
      </div>

      <div className="space-y-3 px-4 py-3">
        <p className="text-xs text-muted-foreground">{stockLine}</p>

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

        <Link className="tcds-link inline-flex w-fit text-sm" href={`/orders/${order.public_reference}`}>
          Ver detalle público
        </Link>

        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Líneas del pedido
          </h3>
          <ul className="mt-2 space-y-2">
            {items.map((item) => (
              <li
                key={item.id}
                className="flex flex-wrap items-baseline justify-between gap-2 border-b border-border/80 py-1.5 last:border-0"
              >
                <span className="min-w-0 flex-1 font-medium text-foreground">{item.title_snapshot}</span>
                <span className="shrink-0 tabular-nums text-muted-foreground">×{item.quantity}</span>
                <span
                  className={`inline-flex shrink-0 rounded px-1.5 py-0.5 text-[11px] font-medium ${fulfillmentChipClass(item.fulfillment_snapshot)}`}
                >
                  {fulfillmentLabel(item.fulfillment_snapshot)}
                </span>
              </li>
            ))}
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
                <li key={event.id} className="border-l-2 border-sky-200 pl-2 dark:border-sky-800">
                  <span className="font-medium text-foreground">
                    {(event.previous_status ?? "—") + " → " + event.new_status}
                  </span>
                  <span className="ml-1 text-muted-foreground">{formatHistoryDate(event.changed_at)}</span>
                </li>
              ))}
            </ul>
          )}
        </details>
      </div>
    </article>
  );
}
