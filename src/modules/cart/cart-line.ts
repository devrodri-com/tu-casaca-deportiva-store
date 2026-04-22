import type { CatalogProductDetailResolution } from "@/modules/catalog/application/get-catalog-product-detail";

export type CartLineCustomization = {
  isCustomized: boolean;
  surchargeAmount: number;
} | null;

export type CartLine = {
  productId: string;
  variantId: string;
  title: string;
  size: string;
  fulfillment: "express" | "made_to_order" | "unavailable";
  promisedDays: {
    minDays: number | null;
    maxDays: number | null;
  };
  finalUnitPrice: number;
  customization: CartLineCustomization;
  quantity: number;
};

type CreateCartLineFromSelectionInput = {
  productId: string;
  variantId: string;
  title: string;
  size: string;
  resolution: CatalogProductDetailResolution;
  quantity: number;
  customizationEnabled: boolean;
  customizationSurcharge: number | null;
};

export function createCartLineFromSelection(
  input: CreateCartLineFromSelectionInput
): CartLine {
  if (input.quantity < 1) {
    throw new Error("quantity must be >= 1");
  }

  const customization: CartLineCustomization = input.customizationEnabled
    ? (() => {
        if (input.customizationSurcharge === null) {
          throw new Error(
            "customizationSurcharge is required when customization is enabled"
          );
        }
        return {
          isCustomized: true,
          surchargeAmount: input.customizationSurcharge,
        };
      })()
    : null;

  return {
    productId: input.productId,
    variantId: input.variantId,
    title: input.title,
    size: input.size,
    fulfillment: input.resolution.fulfillment,
    promisedDays: {
      minDays: input.resolution.promisedDays.minDays,
      maxDays: input.resolution.promisedDays.maxDays,
    },
    finalUnitPrice: input.resolution.finalUnitPrice,
    customization,
    quantity: input.quantity,
  };
}
