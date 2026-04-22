import type { OrderItem, OrderItemSource } from "./order-item";

export type Order = {
  id: string;
  items: OrderItem[];
  total: number;
};

export function buildOrder(params: { id: string; items: OrderItemSource[] }): Order {
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
    items,
    total,
  };
}
