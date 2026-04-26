import type { Database, Json } from "@/lib/supabase/database.types";
import type { Order } from "@/modules/orders";

type OrderInsert = Database["public"]["Tables"]["orders"]["Insert"];
type OrderItemInsert = Database["public"]["Tables"]["order_items"]["Insert"];

export function toOrderRow(order: Order): OrderInsert {
  return {
    id: order.id,
    public_reference: order.publicReference,
    checkout_idempotency_key: order.checkoutIdempotencyKey,
    total: order.total.toString(),
    customer_full_name: order.customer.fullName,
    customer_phone: order.customer.phone,
    customer_email: order.customer.email,
    customer_address: order.customer.address,
    customer_city: order.customer.city,
    customer_department: order.customer.department,
    customer_country: order.customer.country,
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
