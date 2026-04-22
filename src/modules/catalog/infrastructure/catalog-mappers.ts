import type { Database } from "@/lib/supabase/database.types";
import type { Product, ProductVariant } from "@/modules/catalog";

type ProductRow = Database["public"]["Tables"]["products"]["Row"];
type ProductVariantRow = Database["public"]["Tables"]["product_variants"]["Row"];

export type CatalogVariantRecord = {
  variant: ProductVariant;
  unitBasePrice: number;
};

export function mapProductRow(row: ProductRow): Product {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    audience: row.audience,
    productType: row.product_type,
    entity: {
      slug: row.entity_slug,
      name: row.entity_name,
      kind: row.entity_kind,
    },
    era: row.era,
    supportsCustomization: row.supports_customization,
    customizationSurcharge:
      row.customization_surcharge === null
        ? null
        : Number(row.customization_surcharge),
  };
}

export function mapVariantRow(row: ProductVariantRow): CatalogVariantRecord {
  return {
    variant: {
      id: row.id,
      productId: row.product_id,
      size: row.size,
      expressStock: row.express_stock,
      allowMadeToOrder: row.allow_made_to_order,
      madeToOrderMinDays: row.made_to_order_min_days,
      madeToOrderMaxDays: row.made_to_order_max_days,
    },
    unitBasePrice: Number(row.unit_base_price),
  };
}
