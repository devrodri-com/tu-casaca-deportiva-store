import type { Product } from "@/modules/catalog";
import type { ProductVariant } from "@/modules/catalog";

export const baseProduct: Product = {
  id: "00000000-0000-4000-8000-000000000001",
  slug: "test-product",
  title: "Producto de prueba",
  audience: "adult",
  productType: "football_jersey",
  entity: { slug: "club", name: "Club", kind: "club" },
  era: "current",
  supportsCustomization: true,
  customizationSurcharge: 200,
  isActive: true,
};

export function variant(over: Partial<ProductVariant> = {}): ProductVariant {
  return {
    id: "00000000-0000-4000-8000-0000000000a1",
    productId: baseProduct.id,
    size: "L",
    expressStock: 0,
    allowMadeToOrder: false,
    madeToOrderMinDays: null,
    madeToOrderMaxDays: null,
    ...over,
  };
}

export function variantExpress(over: Partial<ProductVariant> = {}): ProductVariant {
  return variant({ expressStock: 5, ...over });
}

export function variantMto(over: Partial<ProductVariant> = {}): ProductVariant {
  return variant({
    expressStock: 0,
    allowMadeToOrder: true,
    madeToOrderMinDays: 14,
    madeToOrderMaxDays: 21,
    ...over,
  });
}

export function variantExpressAndMto(over: Partial<ProductVariant> = {}): ProductVariant {
  return variant({
    expressStock: 3,
    allowMadeToOrder: true,
    madeToOrderMinDays: 14,
    madeToOrderMaxDays: 21,
    ...over,
  });
}

export function variantUnavailable(over: Partial<ProductVariant> = {}): ProductVariant {
  return variant({ expressStock: 0, allowMadeToOrder: false, ...over });
}
