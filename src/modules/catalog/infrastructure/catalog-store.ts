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

export async function getCatalogProductBySlug(
  slug: string
): Promise<CatalogProductRecord | null> {
  const supabase = createServerSupabaseClient();

  const productResult = await supabase
    .from("products")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  if (productResult.error) {
    throw new Error(`Failed to load product: ${productResult.error.message}`);
  }
  if (!productResult.data) {
    return null;
  }

  const variantsResult = await supabase
    .from("product_variants")
    .select("*")
    .eq("product_id", productResult.data.id);
  if (variantsResult.error) {
    throw new Error(
      `Failed to load product variants: ${variantsResult.error.message}`
    );
  }

  return {
    product: mapProductRow(productResult.data),
    variants: variantsResult.data.map((variantRow) => mapVariantRow(variantRow)),
  };
}

export async function getCatalogProductAndVariantByIds(
  productId: string,
  variantId: string
): Promise<{ product: Product; variantRecord: CatalogVariantRecord } | null> {
  const supabase = createServerSupabaseClient();

  const productResult = await supabase
    .from("products")
    .select("*")
    .eq("id", productId)
    .maybeSingle();
  if (productResult.error) {
    throw new Error(`Failed to load product: ${productResult.error.message}`);
  }
  if (!productResult.data) {
    return null;
  }

  const variantResult = await supabase
    .from("product_variants")
    .select("*")
    .eq("id", variantId)
    .eq("product_id", productId)
    .maybeSingle();
  if (variantResult.error) {
    throw new Error(`Failed to load variant: ${variantResult.error.message}`);
  }
  if (!variantResult.data) {
    return null;
  }

  return {
    product: mapProductRow(productResult.data),
    variantRecord: mapVariantRow(variantResult.data),
  };
}
