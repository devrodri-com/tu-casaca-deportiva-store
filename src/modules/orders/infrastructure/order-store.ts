import { createServiceRoleSupabaseClient } from "@/lib/supabase/service-role";
import type { Database } from "@/lib/supabase/database.types";
import type { Order } from "@/modules/orders";
import { toOrderItemRows, toOrderRow } from "./order-mappers";

export async function insertOrder(order: Order): Promise<void> {
  const supabase = createServiceRoleSupabaseClient();

  const orderRow = toOrderRow(order);
  const itemsRows = toOrderItemRows(order);

  const orderInsertResult = await supabase.from("orders").insert(orderRow);
  if (orderInsertResult.error) {
    throw new Error(`Failed to insert order: ${orderInsertResult.error.message}`);
  }

  if (itemsRows.length === 0) {
    return;
  }

  const itemsInsertResult = await supabase.from("order_items").insert(itemsRows);
  if (itemsInsertResult.error) {
    const rollbackResult = await supabase.from("orders").delete().eq("id", order.id);
    if (rollbackResult.error) {
      throw new Error(
        `Failed to insert order items: ${itemsInsertResult.error.message}. Rollback failed: ${rollbackResult.error.message}`
      );
    }
    throw new Error(
      `Failed to insert order items: ${itemsInsertResult.error.message}`
    );
  }
}

type OrderRow = Database["public"]["Tables"]["orders"]["Row"];
type OrderItemRow = Database["public"]["Tables"]["order_items"]["Row"];

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

export async function claimOrderStockDiscount(params: {
  orderId: string;
  discountedAt: string;
}): Promise<boolean> {
  const supabase = createServiceRoleSupabaseClient();
  const result = await supabase
    .from("orders")
    .update({ stock_discounted_at: params.discountedAt })
    .is("stock_discounted_at", null)
    .eq("id", params.orderId)
    .select("id");
  if (result.error) {
    throw new Error(`Failed to mark stock discounted: ${result.error.message}`);
  }
  return (result.data?.length ?? 0) === 1;
}

export async function rollbackOrderStockDiscountClaim(params: {
  orderId: string;
}): Promise<void> {
  const supabase = createServiceRoleSupabaseClient();
  const result = await supabase
    .from("orders")
    .update({ stock_discounted_at: null })
    .eq("id", params.orderId);
  if (result.error) {
    throw new Error(
      `Failed to rollback stock discounted claim: ${result.error.message}`
    );
  }
}

export async function discountExpressStockForOrderItems(
  items: OrderItemRow[]
): Promise<void> {
  const supabase = createServiceRoleSupabaseClient();
  const expressItems = items.filter(
    (item) => item.fulfillment_snapshot === "express"
  );

  for (const item of expressItems) {
    const variantResult = await supabase
      .from("product_variants")
      .select("id, express_stock")
      .eq("id", item.variant_id)
      .maybeSingle();
    if (variantResult.error) {
      throw new Error(
        `Failed to load variant for stock discount: ${variantResult.error.message}`
      );
    }
    if (!variantResult.data) {
      continue;
    }

    const nextStock = Math.max(variantResult.data.express_stock - item.quantity, 0);
    const updateResult = await supabase
      .from("product_variants")
      .update({ express_stock: nextStock })
      .eq("id", item.variant_id);
    if (updateResult.error) {
      throw new Error(
        `Failed to update variant stock: ${updateResult.error.message}`
      );
    }
  }
}
