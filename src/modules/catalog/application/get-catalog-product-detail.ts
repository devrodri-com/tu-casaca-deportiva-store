import { resolveAvailability } from "@/modules/catalog";
import { resolvePurchasableLine } from "@/modules/purchase";
import { getCatalogProductBySlug } from "@/modules/catalog/infrastructure/catalog-store";

export type CatalogProductDetailVariant = {
  id: string;
  size: string;
  availability: "express" | "made_to_order" | "unavailable";
  fulfillment: "express" | "made_to_order" | "unavailable";
  promisedDays: {
    minDays: number | null;
    maxDays: number | null;
  };
  finalUnitPrice: number;
};

export type CatalogProductDetail = {
  slug: string;
  title: string;
  entity: {
    slug: string;
    name: string;
    kind: "club" | "national_team" | "franchise";
  };
  era: "current" | "retro";
  variants: CatalogProductDetailVariant[];
};

export async function getCatalogProductDetail(
  slug: string
): Promise<CatalogProductDetail | null> {
  const record = await getCatalogProductBySlug(slug);
  if (!record) {
    return null;
  }

  return {
    slug: record.product.slug,
    title: record.product.title,
    entity: record.product.entity,
    era: record.product.era,
    variants: record.variants.map(({ variant, unitBasePrice }) => {
      const line = resolvePurchasableLine({
        product: record.product,
        variant,
        unitBasePrice,
        customization: {
          isCustomized: false,
          surchargeAmount: 0,
        },
      });

      return {
        id: variant.id,
        size: variant.size,
        availability: resolveAvailability(variant),
        fulfillment: line.fulfillment,
        promisedDays: line.promisedDays,
        finalUnitPrice: line.finalUnitPrice,
      };
    }),
  };
}
