import "server-only";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/service-role";
import type { AdminProductListQuery } from "@/modules/catalog/admin/admin-product-list-query";
import {
  mapProductRow,
  mapVariantRow,
  type CatalogVariantRecord,
} from "./catalog-mappers";
import type { CatalogProductRecord } from "./catalog-store";
import { sortVariantRecordsBySize } from "./variant-size-order";

export type AdminCatalogProductListRow = CatalogProductRecord & {
  /** Suma de express_stock de todas las variantes (solo lectura para UI). */
  totalExpressStock: number;
};

function escapeIlikePattern(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/%/g, "\\%")
    .replace(/_/g, "\\_");
}

export async function listAdminCatalogProductsWithVariants(
  query: AdminProductListQuery
): Promise<AdminCatalogProductListRow[]> {
  const supabase = createServiceRoleSupabaseClient();

  let productsQuery = supabase.from("products").select("*");

  if (query.status === "active") {
    productsQuery = productsQuery.eq("is_active", true);
  } else if (query.status === "inactive") {
    productsQuery = productsQuery.eq("is_active", false);
  }

  if (query.productType !== "all") {
    productsQuery = productsQuery.eq("product_type", query.productType);
  }

  if (query.audience !== "all") {
    productsQuery = productsQuery.eq("audience", query.audience);
  }

  if (query.customization === "yes") {
    productsQuery = productsQuery.eq("supports_customization", true);
  } else if (query.customization === "no") {
    productsQuery = productsQuery.eq("supports_customization", false);
  }

  const rawSearch = query.search.replace(/,/g, " ").trim();
  if (rawSearch.length > 0) {
    const pattern = `%${escapeIlikePattern(rawSearch)}%`;
    productsQuery = productsQuery.or(
      `title.ilike.${pattern},slug.ilike.${pattern},entity_name.ilike.${pattern}`
    );
  }

  const productsResult = await productsQuery.order("title", { ascending: true });
  if (productsResult.error) {
    throw new Error(`Failed to load products: ${productsResult.error.message}`);
  }

  const productRows = productsResult.data ?? [];
  if (productRows.length === 0) {
    return [];
  }

  const productIds = productRows.map((row) => row.id);

  const variantsResult = await supabase
    .from("product_variants")
    .select("*")
    .in("product_id", productIds);
  if (variantsResult.error) {
    throw new Error(
      `Failed to load product variants: ${variantsResult.error.message}`
    );
  }

  const variantsByProductId = new Map<string, CatalogVariantRecord[]>();
  for (const variantRow of variantsResult.data ?? []) {
    const mapped = mapVariantRow(variantRow);
    const list = variantsByProductId.get(mapped.variant.productId) ?? [];
    list.push(mapped);
    variantsByProductId.set(mapped.variant.productId, list);
  }

  return productRows.map((productRow) => {
    const product = mapProductRow(productRow);
    const variants = sortVariantRecordsBySize(
      variantsByProductId.get(product.id) ?? []
    );
    const totalExpressStock = variants.reduce(
      (sum, { variant }) => sum + variant.expressStock,
      0
    );
    return {
      product,
      variants,
      totalExpressStock,
    };
  });
}
