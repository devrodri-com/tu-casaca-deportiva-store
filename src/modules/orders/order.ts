import type { OrderItem, OrderItemSource } from "./order-item";

export type Order = {
  id: string;
  items: OrderItem[];
  total: number;
};

export function buildOrder(params: { id: string; items: OrderItemSource[] }): Order {
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
    customizationSnapshot: source.customizationSnapshot
      ? {
          isCustomized: source.customizationSnapshot.isCustomized,
          surchargeAmount: source.customizationSnapshot.surchargeAmount,
        }
      : null,
  }));

  const total = items.reduce(
    (accumulator, item) => accumulator + item.unitPriceSnapshot,
    0
  );

  return {
    id: params.id,
    items,
    total,
  };
}
