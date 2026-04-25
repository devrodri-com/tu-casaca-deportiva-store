import type { Database, Json } from "@/lib/supabase/database.types";
import { adminAlert } from "@/app/admin/_lib/admin-ui-classes";

type OrderRow = Database["public"]["Tables"]["orders"]["Row"];
type OrderItemRow = Database["public"]["Tables"]["order_items"]["Row"];

export const AWAITING_PAYMENT_STALE_MINUTES = 30;

export function isAwaitingPaymentPossibleAbandonment(params: {
  paymentStatus: OrderRow["payment_status"];
  createdAt: string;
  now?: Date;
}): boolean {
  if (params.paymentStatus !== "awaiting_payment") {
    return false;
  }
  const createdAtMs = new Date(params.createdAt).getTime();
  if (!Number.isFinite(createdAtMs)) {
    return false;
  }
  const nowMs = (params.now ?? new Date()).getTime();
  const staleMs = AWAITING_PAYMENT_STALE_MINUTES * 60 * 1000;
  return nowMs - createdAtMs > staleMs;
}

export type AdminOrdersFilter =
  | "all"
  | "no_payment"
  | "pending"
  | "paid"
  | "failed"
  | "stock_pending"
  | "stale_payment";

export function parseAdminOrdersFilter(
  raw: string | undefined
): AdminOrdersFilter {
  if (
    raw === "no_payment" ||
    raw === "pending" ||
    raw === "paid" ||
    raw === "failed" ||
    raw === "stock_pending" ||
    raw === "stale_payment"
  ) {
    return raw;
  }
  return "all";
}

export function orderMatchesAdminOrdersFilter(
  order: OrderRow,
  filter: AdminOrdersFilter,
  now?: Date
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
  if (filter === "stale_payment") {
    return isAwaitingPaymentPossibleAbandonment({
      paymentStatus: order.payment_status,
      createdAt: order.created_at,
      now,
    });
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
  stale_payment: number;
};

export function buildAdminOrdersFilterCounts(
  orders: OrderRow[],
  now?: Date
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
    stale_payment: orders.filter((o) =>
      isAwaitingPaymentPossibleAbandonment({
        paymentStatus: o.payment_status,
        createdAt: o.created_at,
        now,
      })
    ).length,
  };
}

/** Etiqueta legible para chips/listados admin (no exponer valores crudos). */
export function adminPaymentStatusLabel(
  status: OrderRow["payment_status"]
): string {
  switch (status) {
    case "awaiting_payment":
      return "Pago: sin iniciar";
    case "pending":
      return "Pago: pendiente (acreditando)";
    case "paid":
      return "Pagado";
    case "failed":
      return "Pago fallido";
  }
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

function formatElapsedSinceCreatedAt(params: {
  createdAt: string;
  now?: Date;
}): string | null {
  const createdAtMs = new Date(params.createdAt).getTime();
  if (!Number.isFinite(createdAtMs)) {
    return null;
  }
  const nowMs = (params.now ?? new Date()).getTime();
  const elapsedMs = nowMs - createdAtMs;
  if (elapsedMs < 0) {
    return null;
  }
  const elapsedMinutes = Math.floor(elapsedMs / (60 * 1000));
  if (elapsedMinutes < 60) {
    return `${elapsedMinutes} min`;
  }
  const elapsedHours = Math.floor(elapsedMinutes / 60);
  return `${elapsedHours} h`;
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
export function getAdminOrderAttention(
  order: OrderRow,
  now?: Date
): AdminOrderAttention {
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
    if (
      order.payment_status === "awaiting_payment" &&
      isAwaitingPaymentPossibleAbandonment({
        paymentStatus: order.payment_status,
        createdAt: order.created_at,
        now,
      })
    ) {
      const ageLabel =
        formatElapsedSinceCreatedAt({ createdAt: order.created_at, now }) ??
        "más de 30 min";
      return {
        kind: "payment_incomplete",
        className: adminAlert.attentionStrong,
        body: `Posible abandono: pedido sin pago desde hace ${ageLabel}. No operar.`,
      };
    }
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
