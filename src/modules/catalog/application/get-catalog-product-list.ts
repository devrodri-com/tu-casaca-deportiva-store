import { listCatalogProductsWithVariants } from "@/modules/catalog/infrastructure/catalog-store";
import { resolveAvailability } from "@/modules/catalog";

export type CatalogProductListItem = {
  slug: string;
  title: string;
  audienceLabel: string;
  productTypeLabel: string;
  deliveryBadgeLabel: "Entrega rapida" | "Por encargo" | "Sin disponibilidad";
};

export async function getCatalogProductList(): Promise<CatalogProductListItem[]> {
  const records = await listCatalogProductsWithVariants();
  return records.map(({ product, variants }) => {
    const availabilities = variants.map(({ variant }) => resolveAvailability(variant));
    const hasExpress = availabilities.includes("express");
    const hasMadeToOrder = availabilities.includes("made_to_order");

    return {
      slug: product.slug,
      title: product.title,
      audienceLabel: product.audience === "adult" ? "Adulto" : "Nino",
      productTypeLabel:
        product.productType === "football_jersey"
          ? "Camiseta de futbol"
          : product.productType === "nba_jersey"
            ? "Camiseta de basquet"
            : "Campera",
      deliveryBadgeLabel: hasExpress
        ? "Entrega rapida"
        : hasMadeToOrder
          ? "Por encargo"
          : "Sin disponibilidad",
    };
  });
}
