import type { ProductVariant } from "./product-variant";

export type CatalogAvailability = "express" | "made_to_order" | "unavailable";

export function resolveAvailability(
  variant: ProductVariant
): CatalogAvailability {
  if (variant.expressStock > 0) {
    return "express";
  }
  if (variant.allowMadeToOrder) {
    return "made_to_order";
  }
  return "unavailable";
}
