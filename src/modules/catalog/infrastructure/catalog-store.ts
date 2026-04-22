import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Product } from "@/modules/catalog";
import {
  mapProductRow,
  mapVariantRow,
  type CatalogVariantRecord,
} from "./catalog-mappers";

export type CatalogProductRecord = {
  product: Product;
  variants: CatalogVariantRecord[];
};

export async function listCatalogProductsWithVariants(): Promise<
  CatalogProductRecord[]
> {
  const supabase = createServerSupabaseClient();

  const productsResult = await supabase.from("products").select("*");
  if (productsResult.error) {
    throw new Error(`Failed to load products: ${productsResult.error.message}`);
  }

  const variantsResult = await supabase.from("product_variants").select("*");
  if (variantsResult.error) {
    throw new Error(
      `Failed to load product variants: ${variantsResult.error.message}`
    );
  }

  const variantsByProductId = new Map<string, CatalogVariantRecord[]>();
  for (const variantRow of variantsResult.data) {
    const mapped = mapVariantRow(variantRow);
    const list = variantsByProductId.get(mapped.variant.productId) ?? [];
    list.push(mapped);
    variantsByProductId.set(mapped.variant.productId, list);
  }

  return productsResult.data.map((productRow) => {
    const product = mapProductRow(productRow);
    return {
      product,
      variants: variantsByProductId.get(product.id) ?? [],
    };
  });
}
