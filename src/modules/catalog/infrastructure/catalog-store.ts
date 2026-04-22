import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/service-role";
import type { Product } from "@/modules/catalog";
import type {
  ValidatedProductInput,
  ValidatedVariantInput,
} from "@/modules/catalog/admin/catalog-admin-validation";
import {
  mapProductRow,
  mapVariantRow,
  type CatalogVariantRecord,
} from "./catalog-mappers";
import {
  ADULT_PRESET_SIZES,
  sortVariantRecordsBySize,
} from "./variant-size-order";

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
      variants: sortVariantRecordsBySize(
        variantsByProductId.get(product.id) ?? []
      ),
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
    variants: sortVariantRecordsBySize(
      variantsResult.data.map((variantRow) => mapVariantRow(variantRow))
    ),
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

export async function updateVariantExpressStock(params: {
  variantId: string;
  expressStock: number;
}): Promise<void> {
  const supabase = createServiceRoleSupabaseClient();
  const result = await supabase
    .from("product_variants")
    .update({ express_stock: params.expressStock })
    .eq("id", params.variantId);
  if (result.error) {
    throw new Error(`Failed to update variant stock: ${result.error.message}`);
  }
}

export async function getCatalogProductWithVariantsById(
  productId: string
): Promise<CatalogProductRecord | null> {
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

  const variantsResult = await supabase
    .from("product_variants")
    .select("*")
    .eq("product_id", productId);
  if (variantsResult.error) {
    throw new Error(
      `Failed to load product variants: ${variantsResult.error.message}`
    );
  }

  return {
    product: mapProductRow(productResult.data),
    variants: sortVariantRecordsBySize(
      variantsResult.data.map((variantRow) => mapVariantRow(variantRow))
    ),
  };
}

/**
 * Crea S–XXL faltantes para un producto adulto, sin duplicar talles.
 * Estado inicial: sin stock, sin encargo (unavailable con reglas de dominio).
 */
export async function createAdultSizePresetVariants(params: {
  productId: string;
  unitBasePrice: number;
}): Promise<void> {
  const supabase = createServiceRoleSupabaseClient();
  const existing = await supabase
    .from("product_variants")
    .select("size")
    .eq("product_id", params.productId);
  if (existing.error) {
    throw new Error(
      `Failed to load existing variants: ${existing.error.message}`
    );
  }
  const have = new Set((existing.data ?? []).map((row) => row.size));
  for (const size of ADULT_PRESET_SIZES) {
    if (have.has(size)) {
      continue;
    }
    const result = await supabase.from("product_variants").insert({
      product_id: params.productId,
      size,
      unit_base_price: String(params.unitBasePrice),
      express_stock: 0,
      allow_made_to_order: false,
      made_to_order_min_days: null,
      made_to_order_max_days: null,
    });
    if (result.error) {
      throw new Error(result.error.message);
    }
  }
}

function productRowFromValidated(input: ValidatedProductInput) {
  return {
    slug: input.slug,
    title: input.title,
    audience: input.audience,
    product_type: input.productType,
    entity_slug: input.entitySlug,
    entity_name: input.entityName,
    entity_kind: input.entityKind,
    era: input.era,
    supports_customization: input.supportsCustomization,
    customization_surcharge:
      input.supportsCustomization && input.customizationSurcharge !== null
        ? String(input.customizationSurcharge)
        : null,
  };
}

function variantRowFromValidated(input: ValidatedVariantInput) {
  return {
    size: input.size,
    unit_base_price: String(input.unitBasePrice),
    express_stock: input.expressStock,
    allow_made_to_order: input.allowMadeToOrder,
    made_to_order_min_days: input.allowMadeToOrder
      ? input.madeToOrderMinDays
      : null,
    made_to_order_max_days: input.allowMadeToOrder
      ? input.madeToOrderMaxDays
      : null,
  };
}

export async function createCatalogProduct(
  input: ValidatedProductInput,
  options?: { initialAdultVariantPrice: number }
): Promise<{ id: string }> {
  const supabase = createServiceRoleSupabaseClient();
  const result = await supabase
    .from("products")
    .insert(productRowFromValidated(input))
    .select("id")
    .single();
  if (result.error) {
    throw new Error(result.error.message);
  }
  if (!result.data) {
    throw new Error("No se pudo crear el producto");
  }
  const { id } = result.data;
  if (
    input.audience === "adult" &&
    options?.initialAdultVariantPrice !== undefined
  ) {
    await createAdultSizePresetVariants({
      productId: id,
      unitBasePrice: options.initialAdultVariantPrice,
    });
  }
  return { id };
}

export async function updateCatalogProduct(
  productId: string,
  input: ValidatedProductInput
): Promise<void> {
  const supabase = createServiceRoleSupabaseClient();
  const result = await supabase
    .from("products")
    .update({
      ...productRowFromValidated(input),
      updated_at: new Date().toISOString(),
    })
    .eq("id", productId);
  if (result.error) {
    throw new Error(result.error.message);
  }
}

export async function createCatalogVariant(params: {
  productId: string;
  input: ValidatedVariantInput;
}): Promise<{ id: string }> {
  const supabase = createServiceRoleSupabaseClient();
  const result = await supabase
    .from("product_variants")
    .insert({
      product_id: params.productId,
      ...variantRowFromValidated(params.input),
    })
    .select("id")
    .single();
  if (result.error) {
    throw new Error(result.error.message);
  }
  if (!result.data) {
    throw new Error("No se pudo crear la variante");
  }
  return { id: result.data.id };
}

export async function updateCatalogVariant(params: {
  productId: string;
  variantId: string;
  input: ValidatedVariantInput;
}): Promise<void> {
  const supabase = createServiceRoleSupabaseClient();
  const result = await supabase
    .from("product_variants")
    .update({
      ...variantRowFromValidated(params.input),
      updated_at: new Date().toISOString(),
    })
    .eq("id", params.variantId)
    .eq("product_id", params.productId);
  if (result.error) {
    throw new Error(result.error.message);
  }
}
