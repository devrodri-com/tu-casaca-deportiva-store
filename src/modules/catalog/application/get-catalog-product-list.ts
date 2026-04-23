import { resolveAvailability } from "@/modules/catalog";
import { listCatalogProductsWithVariants } from "@/modules/catalog/infrastructure/catalog-store";
import { getProductImageRowsForProductIds } from "@/modules/catalog/infrastructure/product-images-store";

export type CatalogProductListItem = {
  slug: string;
  title: string;
  audience: "adult" | "kids";
  productType: "football_jersey" | "nba_jersey" | "jacket";
  audienceLabel: string;
  productTypeLabel: string;
  deliveryBadgeLabel: "Entrega rapida" | "Por encargo" | "Sin stock";
  /** Precio base mínimo entre variantes, para listado comercial */
  displayPrice: number | null;
  primaryImageUrl: string | null;
  primaryImageAlt: string | null;
};

export async function getCatalogProductList(): Promise<CatalogProductListItem[]> {
  const records = await listCatalogProductsWithVariants({ onlyActive: true });
  const imageMap = await getProductImageRowsForProductIds(
    records.map(({ product }) => product.id)
  );
  return records.map(({ product, variants }) => {
    const availabilities = variants.map(({ variant }) => resolveAvailability(variant));
    const hasExpress = availabilities.includes("express");
    const hasMadeToOrder = availabilities.includes("made_to_order");
    const minBasePrice =
      variants.length > 0 ? Math.min(...variants.map(({ unitBasePrice }) => unitBasePrice)) : null;

    const primary = imageMap.get(product.id);
    return {
      slug: product.slug,
      title: product.title,
      audience: product.audience,
      productType: product.productType,
      audienceLabel: product.audience === "adult" ? "Adulto" : "Niños",
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
      displayPrice: minBasePrice,
      primaryImageUrl: primary?.publicUrl ?? null,
      primaryImageAlt: primary?.altText ?? null,
    };
  });
}
