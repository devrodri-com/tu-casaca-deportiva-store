import type {
  PromisedDaysRange,
  PurchasableLine,
  PurchaseCustomization,
  PurchaseFulfillment,
} from "@/modules/purchase";

export type OrderItemCustomizationSnapshot = PurchaseCustomization | null;

export type OrderItem = {
  productId: string;
  variantId: string;
  titleSnapshot: string;
  sizeSnapshot: string;
  fulfillmentSnapshot: PurchaseFulfillment;
  promisedDays: PromisedDaysRange;
  unitPriceSnapshot: number;
  quantity: number;
  customizationSnapshot: OrderItemCustomizationSnapshot;
};

export type OrderItemSource = {
  line: PurchasableLine;
  titleSnapshot: string;
  sizeSnapshot: string;
  quantity: number;
  customizationSnapshot: OrderItemCustomizationSnapshot;
};
