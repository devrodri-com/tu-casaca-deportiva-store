import { resolveAvailability } from "@/modules/catalog";
import { getCatalogProductBySlug } from "@/modules/catalog/infrastructure/catalog-store";
import { listProductImagesByProductId } from "@/modules/catalog/infrastructure/product-images-store";
import { resolvePurchasableLine } from "@/modules/purchase";

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
  sizeLabel: string;
  availability: "express" | "made_to_order" | "unavailable";
  /** true solo con express real y express_stock 1-3; para UI, sin prometer cantidad exacta */
  isLowStock: boolean;
  deliveryLabel: string;
  customizationLabel: string;
  priceLabel: string;
  baseResolution: CatalogProductDetailResolution;
  customizedResolution: CatalogProductDetailResolution | null;
};

export type CatalogProductDetailImage = {
  id: string;
  url: string;
  alt: string | null;
  isPrimary: boolean;
};

export type CatalogProductDetail = {
  productId: string;
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
  images: CatalogProductDetailImage[];
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

    const availability = resolveAvailability(variant);
    const isLowStock = availability === "express" && variant.expressStock <= 3;
    const deliveryLabel =
      availability === "express"
        ? "Entrega en 24-48h"
        : availability === "made_to_order"
          ? "Entrega en 14-21 dias"
          : "Sin disponibilidad";
    const customizationLabel =
      record.product.supportsCustomization &&
      record.product.customizationSurcharge !== null
        ? `Personalizacion: + $${record.product.customizationSurcharge}`
        : "Personalizacion no disponible";

    return {
      id: variant.id,
      sizeLabel: variant.size,
      availability,
      isLowStock,
      deliveryLabel,
      customizationLabel,
      priceLabel: `$${baseLine.finalUnitPrice}`,
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

  const imageRows = await listProductImagesByProductId(record.product.id);
  const images: CatalogProductDetailImage[] = imageRows.map((row) => ({
    id: row.id,
    url: row.publicUrl,
    alt: row.altText,
    isPrimary: row.isPrimary,
  }));

  return {
    productId: record.product.id,
    slug: record.product.slug,
    title: record.product.title,
    entity: record.product.entity,
    era: record.product.era,
    supportsCustomization: record.product.supportsCustomization,
    customizationSurcharge: record.product.customizationSurcharge,
    variants,
    initialVariantId,
    images,
  };
}
