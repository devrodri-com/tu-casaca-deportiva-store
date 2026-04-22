import { listCatalogProductsWithVariants } from "@/modules/catalog/infrastructure/catalog-store";

export type CatalogProductListItem = {
  slug: string;
  title: string;
  audience: "adult" | "kids";
  productType: "football_jersey" | "nba_jersey" | "jacket";
};

export async function getCatalogProductList(): Promise<CatalogProductListItem[]> {
  const records = await listCatalogProductsWithVariants();
  return records.map(({ product }) => ({
    slug: product.slug,
    title: product.title,
    audience: product.audience,
    productType: product.productType,
  }));
}
