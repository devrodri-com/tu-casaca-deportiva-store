import type { OrderItem, OrderItemSource } from "./order-item";
import type { CartLine } from "@/modules/cart";
import type { PurchaseCustomization } from "@/modules/purchase";

/**
 * Lo que se guarda en `order_items.customization_snapshot`: mantiene encargo e importe
 * y, si el usuario cargó datos, dorsal y nombre (para el detalle público del pedido).
 */
function toPersistedCustomizationSnapshot(
  c: PurchaseCustomization
): PurchaseCustomization {
  const base: PurchaseCustomization = {
    isCustomized: c.isCustomized,
    surchargeAmount: c.surchargeAmount,
  };
  const n = (c.jerseyNumber ?? "").trim();
  const name = (c.jerseyName ?? "").trim();
  if (n.length > 0 && name.length > 0) {
    return { ...base, jerseyNumber: n, jerseyName: name };
  }
  return base;
}

export type OrderCustomerSnapshot = {
  fullName: string;
  phone: string;
  email: string | null;
  address: string;
  city: string;
  department: string;
  country: "Uruguay";
};

export type Order = {
  id: string;
  publicReference: string;
  checkoutIdempotencyKey: string | null;
  customer: OrderCustomerSnapshot;
  items: OrderItem[];
  total: number;
};

export function buildOrder(params: {
  id: string;
  publicReference: string;
  checkoutIdempotencyKey?: string | null;
  customer: OrderCustomerSnapshot;
  items: OrderItemSource[];
}): Order {
  for (const source of params.items) {
    if (source.quantity < 1) {
      throw new Error("quantity must be >= 1");
    }
  }

  const items: OrderItem[] = params.items.map((source) => ({
    productId: source.line.productId,
    variantId: source.line.variantId,
    titleSnapshot: source.titleSnapshot,
    sizeSnapshot: source.sizeSnapshot,
    fulfillmentSnapshot: source.line.fulfillment,
    promisedDays: {
      minDays: source.line.promisedDays.minDays,
      maxDays: source.line.promisedDays.maxDays,
    },
    unitPriceSnapshot: source.line.finalUnitPrice,
    quantity: source.quantity,
    customizationSnapshot: source.customizationSnapshot
      ? toPersistedCustomizationSnapshot(source.customizationSnapshot)
      : null,
  }));

  const total = items.reduce(
    (accumulator, item) => accumulator + item.unitPriceSnapshot * item.quantity,
    0
  );

  return {
    id: params.id,
    publicReference: params.publicReference,
    checkoutIdempotencyKey: params.checkoutIdempotencyKey ?? null,
    customer: params.customer,
    items,
    total,
  };
}

export function buildOrderFromCart(params: {
  id: string;
  publicReference: string;
  checkoutIdempotencyKey?: string | null;
  customer: OrderCustomerSnapshot;
  lines: CartLine[];
}): Order {
  for (const line of params.lines) {
    if (line.quantity < 1) {
      throw new Error("quantity must be >= 1");
    }
  }

  const items: OrderItem[] = params.lines.map((line) => ({
    productId: line.productId,
    variantId: line.variantId,
    titleSnapshot: line.title,
    sizeSnapshot: line.size,
    fulfillmentSnapshot: line.fulfillment,
    promisedDays: {
      minDays: line.promisedDays.minDays,
      maxDays: line.promisedDays.maxDays,
    },
    unitPriceSnapshot: line.finalUnitPrice,
    quantity: line.quantity,
    customizationSnapshot: line.customization
      ? toPersistedCustomizationSnapshot({
          isCustomized: line.customization.isCustomized,
          surchargeAmount: line.customization.surchargeAmount,
          jerseyNumber: line.customization.jerseyNumber,
          jerseyName: line.customization.jerseyName,
        })
      : null,
  }));

  const total = items.reduce(
    (accumulator, item) => accumulator + item.unitPriceSnapshot * item.quantity,
    0
  );

  return {
    id: params.id,
    publicReference: params.publicReference,
    checkoutIdempotencyKey: params.checkoutIdempotencyKey ?? null,
    customer: params.customer,
    items,
    total,
  };
}
