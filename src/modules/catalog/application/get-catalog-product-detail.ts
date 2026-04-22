import { resolveAvailability } from "@/modules/catalog";
import { resolvePurchasableLine } from "@/modules/purchase";
import { getCatalogProductBySlug } from "@/modules/catalog/infrastructure/catalog-store";

export type CatalogProductDetailResolution = {
  fulfillment: "express" | "made_to_order" | "unavailable";
  promisedDays: {
    minDays: number | null;
    maxDays: number | null;
  };
  finalUnitPrice: number;
};

export type CatalogProductDetailVariant = {
  id: string;
  size: string;
  availability: "express" | "made_to_order" | "unavailable";
  baseResolution: CatalogProductDetailResolution;
  customizedResolution: CatalogProductDetailResolution | null;
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
  supportsCustomization: boolean;
  customizationSurcharge: number | null;
  variants: CatalogProductDetailVariant[];
  initialVariantId: string | null;
};

export async function getCatalogProductDetail(
  slug: string
): Promise<CatalogProductDetail | null> {
  const record = await getCatalogProductBySlug(slug);
  if (!record) {
    return null;
  }

  const variants = record.variants.map(({ variant, unitBasePrice }) => {
    const baseLine = resolvePurchasableLine({
      product: record.product,
      variant,
      unitBasePrice,
      customization: {
        isCustomized: false,
        surchargeAmount: 0,
      },
    });
    const customizedLine =
      record.product.supportsCustomization &&
      record.product.customizationSurcharge !== null
        ? resolvePurchasableLine({
            product: record.product,
            variant,
            unitBasePrice,
            customization: {
              isCustomized: true,
              surchargeAmount: record.product.customizationSurcharge,
            },
          })
        : null;

    return {
      id: variant.id,
      size: variant.size,
      availability: resolveAvailability(variant),
      baseResolution: {
        fulfillment: baseLine.fulfillment,
        promisedDays: baseLine.promisedDays,
        finalUnitPrice: baseLine.finalUnitPrice,
      },
      customizedResolution: customizedLine
        ? {
            fulfillment: customizedLine.fulfillment,
            promisedDays: customizedLine.promisedDays,
            finalUnitPrice: customizedLine.finalUnitPrice,
          }
        : null,
    };
  });

  const firstAvailableVariant = variants.find(
    (variant) => variant.availability !== "unavailable"
  );
  const initialVariantId = firstAvailableVariant?.id ?? variants[0]?.id ?? null;

  return {
    slug: record.product.slug,
    title: record.product.title,
    entity: record.product.entity,
    era: record.product.era,
    supportsCustomization: record.product.supportsCustomization,
    customizationSurcharge: record.product.customizationSurcharge,
    variants,
    initialVariantId,
  };
}
