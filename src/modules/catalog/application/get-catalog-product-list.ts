import { listCatalogProductsWithVariants } from "@/modules/catalog/infrastructure/catalog-store";
import { resolveAvailability } from "@/modules/catalog";

export type CatalogProductListItem = {
  slug: string;
  title: string;
  audience: "adult" | "kids";
  productType: "football_jersey" | "nba_jersey" | "jacket";
  audienceLabel: string;
  productTypeLabel: string;
  deliveryBadgeLabel: "Entrega rapida" | "Por encargo" | "Sin stock";
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
      audience: product.audience,
      productType: product.productType,
      audienceLabel: product.audience === "adult" ? "Adulto" : "Ninos",
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
          : "Sin stock",
    };
  });
}
