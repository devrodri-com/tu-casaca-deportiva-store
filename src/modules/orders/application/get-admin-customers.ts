import type { Database } from "@/lib/supabase/database.types";

type OrderRow = Database["public"]["Tables"]["orders"]["Row"];

/**
 * Teléfono normalizado para agrupar (espacios fuera; solo dígitos y +).
 */
export function normalizePhoneForCustomerGrouping(phone: string): string {
  const compact = phone.trim().replace(/\s+/g, "");
  if (compact.length === 0) {
    return "";
  }
  return compact.replace(/[^\d+]/g, "");
}

function normalizeEmailForCustomerGrouping(email: string | null): string {
  if (email === null) {
    return "";
  }
  const t = email.trim().toLowerCase();
  return t.length > 0 ? t : "";
}

/**
 * Clave estable por pedido: teléfono → email → nombre + dirección (fallback).
 * Prefijo discrimina el tipo para evitar colisiones (`598` vs email).
 */
export function customerGroupKeyFromOrder(order: OrderRow): string {
  const phone = normalizePhoneForCustomerGrouping(order.customer_phone);
  if (phone.length > 0) {
    return `p:${phone}`;
  }
  const email = normalizeEmailForCustomerGrouping(order.customer_email);
  if (email.length > 0) {
    return `e:${email}`;
  }
  const name = (order.customer_full_name ?? "").trim().toLowerCase();
  const addr = (order.customer_address ?? "").trim().toLowerCase();
  return `n:${name}|${addr}`;
}

export function orderBelongsToCustomerGroup(
  order: OrderRow,
  groupKey: string
): boolean {
  return customerGroupKeyFromOrder(order) === groupKey;
}

function formatSnapshotAddressLine(order: OrderRow): string {
  const parts = [
    order.customer_address.trim(),
    order.customer_city.trim(),
    order.customer_department.trim(),
    order.customer_country.trim(),
  ].filter((p) => p.length > 0);
  return parts.join(", ");
}

export type AdminCustomerOrderBrief = {
  publicReference: string;
  paymentStatus: OrderRow["payment_status"];
};

export type AdminCustomerSummary = {
  groupKey: string;
  displayName: string;
  phoneDisplay: string | null;
  emailTrimmed: string | null;
  lastKnownAddressLine: string;
  totalOrderCount: number;
  paidOrderCount: number;
  /** Suma de `total` solo en pedidos `paid` (número). */
  paidTotalAmount: number;
  lastOrderCreatedAtIso: string;
  lastOrderPublicReference: string;
  /** Referencias públicas, más reciente primero. */
  relatedPublicReferencesDesc: string[];
  /** Hasta 5 pedidos más recientes (ref + pago legible en UI). */
  recentOrdersBrief: AdminCustomerOrderBrief[];
};

export function buildAdminCustomerSummaries(
  orders: OrderRow[]
): AdminCustomerSummary[] {
  const byKey = new Map<string, OrderRow[]>();
  for (const order of orders) {
    const key = customerGroupKeyFromOrder(order);
    const list = byKey.get(key) ?? [];
    list.push(order);
    byKey.set(key, list);
  }

  const out: AdminCustomerSummary[] = [];
  for (const [groupKey, groupOrders] of byKey) {
    const sorted = [...groupOrders].sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    const latest = sorted[0];
    let paidOrderCount = 0;
    let paidTotalAmount = 0;
    for (const o of sorted) {
      if (o.payment_status === "paid") {
        paidOrderCount += 1;
        paidTotalAmount += Number(o.total);
      }
    }
    const emailTrimmed = latest.customer_email?.trim() ?? null;
    const recentOrdersBrief: AdminCustomerOrderBrief[] = sorted
      .slice(0, 5)
      .map((o) => ({
        publicReference: o.public_reference,
        paymentStatus: o.payment_status,
      }));
    out.push({
      groupKey,
      displayName: latest.customer_full_name.trim() || "Sin nombre",
      phoneDisplay: latest.customer_phone.trim() || null,
      emailTrimmed: emailTrimmed && emailTrimmed.length > 0 ? emailTrimmed : null,
      lastKnownAddressLine: formatSnapshotAddressLine(latest),
      totalOrderCount: sorted.length,
      paidOrderCount,
      paidTotalAmount,
      lastOrderCreatedAtIso: latest.created_at,
      lastOrderPublicReference: latest.public_reference,
      relatedPublicReferencesDesc: sorted.map((o) => o.public_reference),
      recentOrdersBrief,
    });
  }

  out.sort(
    (a, b) =>
      new Date(b.lastOrderCreatedAtIso).getTime() -
      new Date(a.lastOrderCreatedAtIso).getTime()
  );
  return out;
}

const MAX_GRUPO_PARAM_LENGTH = 400;

/**
 * Lee `grupo` de la query de admin pedidos (clave interna de agrupación de cliente).
 */
export function parseAdminOrdersGrupoParam(
  raw: string | undefined
): string | undefined {
  if (raw === undefined || raw.trim() === "") {
    return undefined;
  }
  try {
    const decoded = decodeURIComponent(raw.trim());
    if (decoded.length === 0 || decoded.length > MAX_GRUPO_PARAM_LENGTH) {
      return undefined;
    }
    return decoded;
  } catch {
    return undefined;
  }
}
