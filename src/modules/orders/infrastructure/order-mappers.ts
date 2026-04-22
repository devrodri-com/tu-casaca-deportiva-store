import type { Database, Json } from "@/lib/supabase/database.types";
import type { Order } from "@/modules/orders";

type OrderInsert = Database["public"]["Tables"]["orders"]["Insert"];
type OrderItemInsert = Database["public"]["Tables"]["order_items"]["Insert"];

export function toOrderRow(order: Order): OrderInsert {
  return {
    id: order.id,
    total: order.total.toString(),
  };
}

export function toOrderItemRows(order: Order): OrderItemInsert[] {
  return order.items.map((item) => ({
    order_id: order.id,
    product_id: item.productId,
    variant_id: item.variantId,
    title_snapshot: item.titleSnapshot,
    size_snapshot: item.sizeSnapshot,
    fulfillment_snapshot: item.fulfillmentSnapshot,
    promised_min_days: item.promisedDays.minDays,
    promised_max_days: item.promisedDays.maxDays,
    unit_price_snapshot: item.unitPriceSnapshot.toString(),
    quantity: item.quantity,
    customization_snapshot: (item.customizationSnapshot ?? null) as Json | null,
  }));
}
