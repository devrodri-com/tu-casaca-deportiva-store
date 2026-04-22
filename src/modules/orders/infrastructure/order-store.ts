import { createServiceRoleSupabaseClient } from "@/lib/supabase/service-role";
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
