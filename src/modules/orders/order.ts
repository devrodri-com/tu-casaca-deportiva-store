import type { OrderItem, OrderItemSource } from "./order-item";
import type { CartLine } from "@/modules/cart";

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
  customer: OrderCustomerSnapshot;
  items: OrderItem[];
  total: number;
};

export function buildOrder(params: {
  id: string;
  publicReference: string;
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
      ? {
          isCustomized: source.customizationSnapshot.isCustomized,
          surchargeAmount: source.customizationSnapshot.surchargeAmount,
        }
      : null,
  }));

  const total = items.reduce(
    (accumulator, item) => accumulator + item.unitPriceSnapshot * item.quantity,
    0
  );

  return {
    id: params.id,
    publicReference: params.publicReference,
    customer: params.customer,
    items,
    total,
  };
}

export function buildOrderFromCart(params: {
  id: string;
  publicReference: string;
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
      ? {
          isCustomized: line.customization.isCustomized,
          surchargeAmount: line.customization.surchargeAmount,
        }
      : null,
  }));

  const total = items.reduce(
    (accumulator, item) => accumulator + item.unitPriceSnapshot * item.quantity,
    0
  );

  return {
    id: params.id,
    publicReference: params.publicReference,
    customer: params.customer,
    items,
    total,
  };
}
