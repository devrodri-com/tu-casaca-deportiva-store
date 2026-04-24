import { createServiceRoleSupabaseClient } from "@/lib/supabase/service-role";
import type { Database } from "@/lib/supabase/database.types";
import type { Order } from "@/modules/orders";
import { toOrderItemRows, toOrderRow } from "./order-mappers";

export async function insertOrder(order: Order): Promise<void> {
  if (order.items.length === 0) {
    throw new Error("El pedido debe incluir al menos un item.");
  }

  const supabase = createServiceRoleSupabaseClient();
  const result = await supabase.rpc("insert_order_with_items", {
    p_order: toOrderRow(order),
    p_items: toOrderItemRows(order),
  });
  if (result.error) {
    throw new Error(`Failed to insert order: ${result.error.message}`);
  }
}

type OrderRow = Database["public"]["Tables"]["orders"]["Row"];
type OrderItemRow = Database["public"]["Tables"]["order_items"]["Row"];
type OrderStatusHistoryRow =
  Database["public"]["Tables"]["order_status_history"]["Row"];
type OperationalStatus =
  | "paid"
  | "preparing"
  | "ready"
  | "shipped"
  | "delivered"
  | "cancelled";

export async function getOrderWithItemsById(orderId: string): Promise<{
  order: OrderRow;
  items: OrderItemRow[];
} | null> {
  const supabase = createServiceRoleSupabaseClient();

  const orderResult = await supabase
    .from("orders")
    .select("*")
    .eq("id", orderId)
    .maybeSingle();
  if (orderResult.error) {
    throw new Error(`Failed to load order: ${orderResult.error.message}`);
  }
  if (!orderResult.data) {
    return null;
  }

  const itemsResult = await supabase
    .from("order_items")
    .select("*")
    .eq("order_id", orderId);
  if (itemsResult.error) {
    throw new Error(`Failed to load order items: ${itemsResult.error.message}`);
  }

  return {
    order: orderResult.data,
    items: itemsResult.data,
  };
}

export async function getOrderWithItemsByPublicReference(
  publicReference: string
): Promise<{
  order: OrderRow;
  items: OrderItemRow[];
} | null> {
  const supabase = createServiceRoleSupabaseClient();

  const orderResult = await supabase
    .from("orders")
    .select("*")
    .eq("public_reference", publicReference)
    .maybeSingle();
  if (orderResult.error) {
    throw new Error(`Failed to load order: ${orderResult.error.message}`);
  }
  if (!orderResult.data) {
    return null;
  }

  const itemsResult = await supabase
    .from("order_items")
    .select("*")
    .eq("order_id", orderResult.data.id);
  if (itemsResult.error) {
    throw new Error(`Failed to load order items: ${itemsResult.error.message}`);
  }

  return {
    order: orderResult.data,
    items: itemsResult.data,
  };
}

export async function listOrdersWithItems(): Promise<
  { order: OrderRow; items: OrderItemRow[] }[]
> {
  const supabase = createServiceRoleSupabaseClient();

  const ordersResult = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });
  if (ordersResult.error) {
    throw new Error(`Failed to load orders: ${ordersResult.error.message}`);
  }

  const itemsResult = await supabase.from("order_items").select("*");
  if (itemsResult.error) {
    throw new Error(`Failed to load order items: ${itemsResult.error.message}`);
  }

  const itemsByOrderId = new Map<string, OrderItemRow[]>();
  for (const item of itemsResult.data) {
    const list = itemsByOrderId.get(item.order_id) ?? [];
    list.push(item);
    itemsByOrderId.set(item.order_id, list);
  }

  return ordersResult.data.map((order) => ({
    order,
    items: itemsByOrderId.get(order.id) ?? [],
  }));
}

export async function updateOrderMercadoPagoPreferenceId(params: {
  orderId: string;
  preferenceId: string;
}): Promise<void> {
  const supabase = createServiceRoleSupabaseClient();
  const result = await supabase
    .from("orders")
    .update({ mercado_pago_preference_id: params.preferenceId })
    .eq("id", params.orderId);
  if (result.error) {
    throw new Error(
      `Failed to update Mercado Pago preference id: ${result.error.message}`
    );
  }
}

export async function updateOrderPaymentState(params: {
  orderId: string;
  paymentStatus: "awaiting_payment" | "pending" | "paid" | "failed";
  mercadoPagoPaymentId: string | null;
  mercadoPagoStatus: string | null;
  paidAt: string | null;
}): Promise<void> {
  const supabase = createServiceRoleSupabaseClient();
  const result = await supabase
    .from("orders")
    .update({
      payment_status: params.paymentStatus,
      mercado_pago_payment_id: params.mercadoPagoPaymentId,
      mercado_pago_status: params.mercadoPagoStatus,
      paid_at: params.paidAt,
    })
    .eq("id", params.orderId);
  if (result.error) {
    throw new Error(`Failed to update payment state: ${result.error.message}`);
  }
}

export async function initializeOrderOperationalStatusAsPaid(params: {
  orderId: string;
  updatedAt: string;
}): Promise<boolean> {
  const supabase = createServiceRoleSupabaseClient();
  const result = await supabase
    .from("orders")
    .update({
      operational_status: "paid",
      operational_updated_at: params.updatedAt,
    })
    .is("operational_status", null)
    .eq("id", params.orderId)
    .select("id");
  if (result.error) {
    throw new Error(
      `Failed to initialize operational status: ${result.error.message}`
    );
  }
  return (result.data?.length ?? 0) === 1;
}

/**
 * Descuento atómico de stock express + marca `stock_discounted_at` (RPC Postgres).
 * Idempotente: si el pedido ya tenía `stock_discounted_at`, devuelve false y no modifica variantes.
 * Si falta stock express, la RPC hace rollback completo y lanza error (no queda parcial ni fecha seteada).
 */
export async function discountOrderExpressStockAtomic(params: {
  orderId: string;
  discountedAt: string;
}): Promise<boolean> {
  const supabase = createServiceRoleSupabaseClient();
  const result = await supabase.rpc("discount_order_express_stock", {
    p_order_id: params.orderId,
    p_discounted_at: params.discountedAt,
  });
  if (result.error) {
    throw new Error(result.error.message);
  }
  return result.data === true;
}

export async function updateOrderOperationalStatus(params: {
  orderId: string;
  nextOperationalStatus: OperationalStatus;
  updatedAt: string;
}): Promise<void> {
  const supabase = createServiceRoleSupabaseClient();
  const result = await supabase
    .from("orders")
    .update({
      operational_status: params.nextOperationalStatus,
      operational_updated_at: params.updatedAt,
    })
    .eq("id", params.orderId);
  if (result.error) {
    throw new Error(
      `Failed to update operational status: ${result.error.message}`
    );
  }
}

export async function applyOrderOperationalStatusChangeWithHistory(params: {
  orderId: string;
  previousStatus: OperationalStatus | null;
  previousUpdatedAt: string | null;
  nextStatus: OperationalStatus;
  changedAt: string;
  changedBy: string | null;
  expectedCurrentStatus?: OperationalStatus | null;
}): Promise<boolean> {
  if (params.previousStatus === params.nextStatus) {
    return false;
  }

  const supabase = createServiceRoleSupabaseClient();
  let updateQuery = supabase
    .from("orders")
    .update({
      operational_status: params.nextStatus,
      operational_updated_at: params.changedAt,
    })
    .eq("id", params.orderId);

  if (params.expectedCurrentStatus === null) {
    updateQuery = updateQuery.is("operational_status", null);
  } else if (params.expectedCurrentStatus !== undefined) {
    updateQuery = updateQuery.eq(
      "operational_status",
      params.expectedCurrentStatus
    );
  }

  const updateResult = await updateQuery.select("id");
  if (updateResult.error) {
    throw new Error(
      `Failed to update operational status: ${updateResult.error.message}`
    );
  }
  if ((updateResult.data?.length ?? 0) !== 1) {
    return false;
  }

  try {
    await appendOrderOperationalStatusHistory({
      orderId: params.orderId,
      previousStatus: params.previousStatus,
      newStatus: params.nextStatus,
      changedAt: params.changedAt,
      changedBy: params.changedBy,
    });
  } catch (historyError) {
    const rollbackResult = await supabase
      .from("orders")
      .update({
        operational_status: params.previousStatus,
        operational_updated_at: params.previousUpdatedAt,
      })
      .eq("operational_status", params.nextStatus)
      .eq("operational_updated_at", params.changedAt)
      .eq("id", params.orderId);

    if (rollbackResult.error) {
      throw new Error(
        `Failed to append order status history and rollback operational status: ${rollbackResult.error.message}`
      );
    }
    throw historyError;
  }

  return true;
}

export async function appendOrderOperationalStatusHistory(params: {
  orderId: string;
  previousStatus: OperationalStatus | null;
  newStatus: OperationalStatus;
  changedAt: string;
  changedBy: string | null;
}): Promise<void> {
  if (params.previousStatus === params.newStatus) {
    return;
  }

  const supabase = createServiceRoleSupabaseClient();
  const result = await supabase.from("order_status_history").insert({
    order_id: params.orderId,
    previous_status: params.previousStatus,
    new_status: params.newStatus,
    changed_at: params.changedAt,
    changed_by: params.changedBy,
  });
  if (result.error) {
    throw new Error(
      `Failed to append order status history: ${result.error.message}`
    );
  }
}

export async function listOrderStatusHistoryByOrderIds(
  orderIds: string[]
): Promise<Map<string, OrderStatusHistoryRow[]>> {
  const byOrderId = new Map<string, OrderStatusHistoryRow[]>();
  if (orderIds.length === 0) {
    return byOrderId;
  }

  const supabase = createServiceRoleSupabaseClient();
  const result = await supabase
    .from("order_status_history")
    .select("*")
    .in("order_id", orderIds)
    .order("changed_at", { ascending: false });
  if (result.error) {
    throw new Error(
      `Failed to load order status history: ${result.error.message}`
    );
  }

  for (const row of result.data) {
    const list = byOrderId.get(row.order_id) ?? [];
    list.push(row);
    byOrderId.set(row.order_id, list);
  }
  return byOrderId;
}
