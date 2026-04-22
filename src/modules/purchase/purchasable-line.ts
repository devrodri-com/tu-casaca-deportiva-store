import {
  isValidMadeToOrderRange,
  resolveAvailability,
  type Product,
  type ProductVariant,
} from "@/modules/catalog";
import type { PurchaseCustomization } from "./customization";

const EXPRESS_PROMISED_MIN_DAYS = 0;
const EXPRESS_PROMISED_MAX_DAYS = 2;

export type PurchaseFulfillment = "express" | "made_to_order" | "unavailable";

export type PromisedDaysRange = {
  minDays: number | null;
  maxDays: number | null;
};

export type PurchasableLineInput = {
  product: Product;
  variant: ProductVariant;
  unitBasePrice: number;
  customization: PurchaseCustomization;
};

export type PurchasableLine = {
  productId: string;
  variantId: string;
  finalUnitPrice: number;
  fulfillment: PurchaseFulfillment;
  promisedDays: PromisedDaysRange;
};

export function resolvePurchasableLine(
  input: PurchasableLineInput
): PurchasableLine {
  if (input.variant.productId !== input.product.id) {
    throw new Error("variant.productId must match product.id");
  }
  if (input.unitBasePrice < 0) {
    throw new Error("unitBasePrice must be >= 0");
  }
  if (input.customization.surchargeAmount < 0) {
    throw new Error("customization.surchargeAmount must be >= 0");
  }

  const finalUnitPrice =
    input.unitBasePrice + input.customization.surchargeAmount;
  const baseAvailability = resolveAvailability(input.variant);

  if (baseAvailability === "unavailable") {
    return {
      productId: input.product.id,
      variantId: input.variant.id,
      finalUnitPrice,
      fulfillment: "unavailable",
      promisedDays: { minDays: null, maxDays: null },
    };
  }

  if (input.customization.isCustomized) {
    if (!isValidMadeToOrderRange(input.variant)) {
      throw new Error(
        "Customized line requires a valid made-to-order promised days range"
      );
    }

    return {
      productId: input.product.id,
      variantId: input.variant.id,
      finalUnitPrice,
      fulfillment: "made_to_order",
      promisedDays: {
        minDays: input.variant.madeToOrderMinDays,
        maxDays: input.variant.madeToOrderMaxDays,
      },
    };
  }

  if (baseAvailability === "express") {
    return {
      productId: input.product.id,
      variantId: input.variant.id,
      finalUnitPrice,
      fulfillment: "express",
      promisedDays: {
        minDays: EXPRESS_PROMISED_MIN_DAYS,
        maxDays: EXPRESS_PROMISED_MAX_DAYS,
      },
    };
  }

  if (!isValidMadeToOrderRange(input.variant)) {
    throw new Error("made_to_order line requires a valid promised days range");
  }

  return {
    productId: input.product.id,
    variantId: input.variant.id,
    finalUnitPrice,
    fulfillment: "made_to_order",
    promisedDays: {
      minDays: input.variant.madeToOrderMinDays,
      maxDays: input.variant.madeToOrderMaxDays,
    },
  };
}
