import type { Database, Json } from "@/lib/supabase/database.types";
import { adminAlert } from "@/app/admin/_lib/admin-ui-classes";

type OrderRow = Database["public"]["Tables"]["orders"]["Row"];
type OrderItemRow = Database["public"]["Tables"]["order_items"]["Row"];

export type AdminOrdersFilter =
  | "all"
  | "no_payment"
  | "pending"
  | "paid"
  | "failed"
  | "stock_pending";

export function parseAdminOrdersFilter(
  raw: string | undefined
): AdminOrdersFilter {
  if (
    raw === "no_payment" ||
    raw === "pending" ||
    raw === "paid" ||
    raw === "failed" ||
    raw === "stock_pending"
  ) {
    return raw;
  }
  return "all";
}

export function orderMatchesAdminOrdersFilter(
  order: OrderRow,
  filter: AdminOrdersFilter
): boolean {
  if (filter === "all") {
    return true;
  }
  if (filter === "no_payment") {
    return order.payment_status === "awaiting_payment";
  }
  if (filter === "pending") {
    return order.payment_status === "pending";
  }
  if (filter === "paid") {
    return order.payment_status === "paid";
  }
  if (filter === "failed") {
    return order.payment_status === "failed";
  }
  if (filter === "stock_pending") {
    return (
      order.payment_status === "paid" && order.stock_discounted_at === null
    );
  }
  return true;
}

function customizationSnapshotIndicatesLine(
  snapshot: Json | null
): boolean {
  if (snapshot === null || typeof snapshot !== "object" || Array.isArray(snapshot)) {
    return false;
  }
  const o = snapshot as Record<string, unknown>;
  return o.isCustomized === true;
}

export function orderHasCustomizationLine(items: OrderItemRow[]): boolean {
  return items.some((item) =>
    customizationSnapshotIndicatesLine(item.customization_snapshot)
  );
}

export type AdminOrdersFilterCounts = {
  all: number;
  no_payment: number;
  pending: number;
  paid: number;
  failed: number;
  stock_pending: number;
};

export function buildAdminOrdersFilterCounts(
  orders: OrderRow[]
): AdminOrdersFilterCounts {
  return {
    all: orders.length,
    no_payment: orders.filter((o) => o.payment_status === "awaiting_payment")
      .length,
    pending: orders.filter((o) => o.payment_status === "pending").length,
    paid: orders.filter((o) => o.payment_status === "paid").length,
    failed: orders.filter((o) => o.payment_status === "failed").length,
    stock_pending: orders.filter(
      (o) => o.payment_status === "paid" && o.stock_discounted_at === null
    ).length,
  };
}

export function formatOrderCreatedAtEsUy(iso: string): string {
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

export type AdminOrderAttention =
  | { kind: "failed"; className: string; body: string }
  | { kind: "payment_incomplete"; className: string; body: string }
  | { kind: "stock_pending"; className: string; body: string }
  | { kind: "stock_ok"; className: string; body: string; atLabel: string };

function formatDateTimeLocal(iso: string): string {
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

/**
 * Resumen operativo por pedido: qué pide atención y estado de descontar stock.
 * No aplica a pedidos aún no pagados (salvo pago en curso) o fallidos.
 */
export function getAdminOrderAttention(order: OrderRow): AdminOrderAttention {
  if (order.payment_status === "failed") {
    return {
      kind: "failed",
      className: adminAlert.error,
      body: "Pago no aprobado. Este pedido no es operativo: no descontar stock ni planificar entrega.",
    };
  }
  if (
    order.payment_status === "awaiting_payment" ||
    order.payment_status === "pending"
  ) {
    return {
      kind: "payment_incomplete",
      className: adminAlert.warning,
      body:
        "Pago sin confirmar - no descontar stock ni preparar. No tratarlo como listo para operar hasta ver la etiqueta Pagado.",
    };
  }
  if (order.payment_status === "paid") {
    if (order.stock_discounted_at === null) {
      return {
        kind: "stock_pending",
        className: adminAlert.attentionStrong,
        body:
          "Pago confirmado - stock express pendiente de descontar. Esperá la confirmación del webhook de Mercado Pago o revisá si hubo un error.",
      };
    }
    return {
      kind: "stock_ok",
      className: adminAlert.success,
      body: "Stock descontado",
      atLabel: formatDateTimeLocal(order.stock_discounted_at),
    };
  }
  const _exhaust: never = order.payment_status;
  return _exhaust;
}

export function orderFulfillmentFlags(items: OrderItemRow[]): {
  hasExpress: boolean;
  hasMadeToOrder: boolean;
} {
  let hasExpress = false;
  let hasMadeToOrder = false;
  for (const item of items) {
    if (item.fulfillment_snapshot === "express") {
      hasExpress = true;
    }
    if (item.fulfillment_snapshot === "made_to_order") {
      hasMadeToOrder = true;
    }
  }
  return { hasExpress, hasMadeToOrder };
}
