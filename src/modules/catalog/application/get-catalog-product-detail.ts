import { isValidMadeToOrderRange, resolveAvailability } from "@/modules/catalog";
import { getCatalogProductBySlug } from "@/modules/catalog/infrastructure/catalog-store";
import { listProductImagesByProductId } from "@/modules/catalog/infrastructure/product-images-store";
import { fulfillmentDeliveryLine } from "@/modules/orders/application/fulfillment-presentation";
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
  expressStock: number;
  canMadeToOrder: boolean;
  /** true solo con express real y express_stock 1-3; para UI, sin prometer cantidad exacta */
  isLowStock: boolean;
  deliveryLabel: string;
  customizationLabel: string;
  priceLabel: string;
  baseResolution: CatalogProductDetailResolution;
  madeToOrderResolution: CatalogProductDetailResolution | null;
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
  audienceLabel: string;
  productTypeLabel: string;
  startingPrice: number | null;
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
    const customizationSurcharge = record.product.customizationSurcharge;
    const canOfferCustomizationOnThisVariant =
      record.product.supportsCustomization &&
      customizationSurcharge !== null &&
      variant.allowMadeToOrder &&
      isValidMadeToOrderRange(variant);
    const customizedLine = canOfferCustomizationOnThisVariant
      ? resolvePurchasableLine({
          product: record.product,
          variant,
          unitBasePrice,
          customization: {
            isCustomized: true,
            surchargeAmount: customizationSurcharge,
          },
        })
      : null;

    const availability = resolveAvailability(variant);
    const isLowStock = availability === "express" && variant.expressStock <= 3;
    const canMadeToOrder =
      variant.allowMadeToOrder &&
      variant.madeToOrderMinDays !== null &&
      variant.madeToOrderMaxDays !== null;
    const madeToOrderResolution: CatalogProductDetailResolution | null =
      canMadeToOrder
        ? {
            fulfillment: "made_to_order",
            promisedDays: {
              minDays: variant.madeToOrderMinDays,
              maxDays: variant.madeToOrderMaxDays,
            },
            finalUnitPrice: baseLine.finalUnitPrice,
          }
        : null;
    const deliveryLabel = fulfillmentDeliveryLine({
      fulfillment: availability,
      minDays: variant.madeToOrderMinDays,
      maxDays: variant.madeToOrderMaxDays,
    });
    const customizationLabel =
      record.product.supportsCustomization &&
      record.product.customizationSurcharge !== null
        ? `Personalizacion: + $${record.product.customizationSurcharge}`
        : "Personalizacion no disponible";

    return {
      id: variant.id,
      sizeLabel: variant.size,
      availability,
      expressStock: variant.expressStock,
      canMadeToOrder,
      isLowStock,
      deliveryLabel,
      customizationLabel,
      priceLabel: `$${baseLine.finalUnitPrice}`,
      baseResolution: {
        fulfillment: baseLine.fulfillment,
        promisedDays: baseLine.promisedDays,
        finalUnitPrice: baseLine.finalUnitPrice,
      },
      madeToOrderResolution,
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
  const startingPrice =
    variants.length > 0
      ? Math.min(...variants.map((variant) => variant.baseResolution.finalUnitPrice))
      : null;
  const productTypeLabel =
    record.product.productType === "football_jersey"
      ? "Camiseta de fútbol"
      : record.product.productType === "nba_jersey"
        ? "Camiseta de NBA"
        : "Campera";
  const audienceLabel = record.product.audience === "adult" ? "Adulto" : "Niños";

  return {
    productId: record.product.id,
    slug: record.product.slug,
    title: record.product.title,
    audienceLabel,
    productTypeLabel,
    startingPrice,
    entity: record.product.entity,
    era: record.product.era,
    supportsCustomization: record.product.supportsCustomization,
    customizationSurcharge: record.product.customizationSurcharge,
    variants,
    initialVariantId,
    images,
  };
}
