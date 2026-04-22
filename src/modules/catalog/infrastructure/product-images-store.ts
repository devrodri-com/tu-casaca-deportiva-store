import "server-only";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/service-role";
import { getProductImagePublicUrl, removeProductImageObject } from "./product-images-storage";

export type CatalogProductImageRow = {
  id: string;
  storagePath: string;
  publicUrl: string;
  altText: string | null;
  sortOrder: number;
  isPrimary: boolean;
};

function mapRow(row: {
  id: string;
  storage_path: string;
  alt_text: string | null;
  sort_order: number;
  is_primary: boolean;
}): CatalogProductImageRow {
  return {
    id: row.id,
    storagePath: row.storage_path,
    publicUrl: getProductImagePublicUrl(row.storage_path),
    altText: row.alt_text,
    sortOrder: row.sort_order,
    isPrimary: row.is_primary,
  };
}

export async function getProductSlugByProductId(
  productId: string
): Promise<string | null> {
  const supabase = createServiceRoleSupabaseClient();
  const result = await supabase
    .from("products")
    .select("slug")
    .eq("id", productId)
    .maybeSingle();
  if (result.error) {
    throw new Error(result.error.message);
  }
  return result.data?.slug ?? null;
}

export async function listProductImagesByProductId(
  productId: string
): Promise<CatalogProductImageRow[]> {
  const supabase = createServerSupabaseClient();
  const result = await supabase
    .from("product_images")
    .select("id, storage_path, alt_text, sort_order, is_primary")
    .eq("product_id", productId)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });
  if (result.error) {
    throw new Error(result.error.message);
  }
  return (result.data ?? []).map((row) => mapRow(row));
}

export async function getProductImageRowsForProductIds(
  productIds: readonly string[]
): Promise<Map<string, CatalogProductImageRow>> {
  const map = new Map<string, CatalogProductImageRow>();
  if (productIds.length === 0) {
    return map;
  }
  const supabase = createServerSupabaseClient();
  const result = await supabase
    .from("product_images")
    .select("id, product_id, storage_path, alt_text, sort_order, is_primary, created_at")
    .in("product_id", [...productIds])
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });
  if (result.error) {
    throw new Error(result.error.message);
  }
  const allRows = result.data ?? [];
  type ImageRow = (typeof allRows)[number];
  const byProduct = new Map<string, ImageRow[]>();
  for (const row of allRows) {
    const list = byProduct.get(row.product_id) ?? [];
    list.push(row);
    byProduct.set(row.product_id, list);
  }
  for (const [pid, rows] of byProduct) {
    const primary = rows.find((r) => r.is_primary);
    const chosen = primary ?? rows[0];
    if (chosen) {
      map.set(pid, mapRow(chosen));
    }
  }
  return map;
}

export async function insertProductImageMetadata(params: {
  productId: string;
  storagePath: string;
  altText: string | null;
  isPrimary: boolean;
  sortOrder: number;
}): Promise<{ id: string }> {
  const supabase = createServiceRoleSupabaseClient();
  const result = await supabase
    .from("product_images")
    .insert({
      product_id: params.productId,
      storage_path: params.storagePath,
      alt_text: params.altText,
      is_primary: params.isPrimary,
      sort_order: params.sortOrder,
    })
    .select("id")
    .single();
  if (result.error) {
    throw new Error(result.error.message);
  }
  if (!result.data) {
    throw new Error("No se pudo registrar la imagen");
  }
  return { id: result.data.id };
}

export async function setProductImagePrimary(params: {
  productId: string;
  imageId: string;
}): Promise<void> {
  const supabase = createServiceRoleSupabaseClient();
  const target = await supabase
    .from("product_images")
    .select("id")
    .eq("product_id", params.productId)
    .eq("id", params.imageId)
    .maybeSingle();
  if (target.error) {
    throw new Error(target.error.message);
  }
  if (!target.data) {
    throw new Error("Imagen no encontrada");
  }
  const clear = await supabase
    .from("product_images")
    .update({ is_primary: false })
    .eq("product_id", params.productId);
  if (clear.error) {
    throw new Error(clear.error.message);
  }
  const mark = await supabase
    .from("product_images")
    .update({ is_primary: true })
    .eq("product_id", params.productId)
    .eq("id", params.imageId)
    .select("id")
    .maybeSingle();
  if (mark.error) {
    throw new Error(mark.error.message);
  }
  if (!mark.data) {
    throw new Error("No se pudo marcar la imagen principal");
  }
}

export async function deleteProductImageRow(params: {
  productId: string;
  imageId: string;
}): Promise<{ storagePath: string } | null> {
  const supabase = createServiceRoleSupabaseClient();
  const row = await supabase
    .from("product_images")
    .select("id, storage_path, is_primary")
    .eq("product_id", params.productId)
    .eq("id", params.imageId)
    .maybeSingle();
  if (row.error) {
    throw new Error(row.error.message);
  }
  if (!row.data) {
    return null;
  }
  const wasPrimary = row.data.is_primary;
  const storagePath = row.data.storage_path;
  await removeProductImageObject(storagePath);
  const del = await supabase
    .from("product_images")
    .delete()
    .eq("product_id", params.productId)
    .eq("id", params.imageId);
  if (del.error) {
    throw new Error(del.error.message);
  }
  if (!wasPrimary) {
    return { storagePath };
  }
  const remaining = await supabase
    .from("product_images")
    .select("id")
    .eq("product_id", params.productId)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });
  if (remaining.error) {
    throw new Error(remaining.error.message);
  }
  const list = remaining.data ?? [];
  if (list.length === 0) {
    return { storagePath };
  }
  const nextPrimaryId = list[0].id;
  const clear = await supabase
    .from("product_images")
    .update({ is_primary: false })
    .eq("product_id", params.productId);
  if (clear.error) {
    throw new Error(clear.error.message);
  }
  const mark = await supabase
    .from("product_images")
    .update({ is_primary: true })
    .eq("product_id", params.productId)
    .eq("id", nextPrimaryId);
  if (mark.error) {
    throw new Error(mark.error.message);
  }
  return { storagePath };
}

export async function getNextProductImageSortOrder(productId: string): Promise<number> {
  const supabase = createServiceRoleSupabaseClient();
  const result = await supabase
    .from("product_images")
    .select("sort_order")
    .eq("product_id", productId)
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (result.error) {
    throw new Error(result.error.message);
  }
  const max = result.data?.sort_order;
  return typeof max === "number" ? max + 1 : 0;
}

export async function countProductImages(productId: string): Promise<number> {
  const supabase = createServiceRoleSupabaseClient();
  const result = await supabase
    .from("product_images")
    .select("id", { count: "exact", head: true })
    .eq("product_id", productId);
  if (result.error) {
    throw new Error(result.error.message);
  }
  return result.count ?? 0;
}

export async function moveProductImageSort(params: {
  productId: string;
  imageId: string;
  direction: "up" | "down";
}): Promise<void> {
  const supabase = createServiceRoleSupabaseClient();
  const list = await supabase
    .from("product_images")
    .select("id, sort_order")
    .eq("product_id", params.productId)
    .order("sort_order", { ascending: true })
    .order("id", { ascending: true });
  if (list.error) {
    throw new Error(list.error.message);
  }
  const rows = list.data ?? [];
  const idx = rows.findIndex((r) => r.id === params.imageId);
  if (idx < 0) {
    return;
  }
  const swapWith = params.direction === "up" ? idx - 1 : idx + 1;
  if (swapWith < 0 || swapWith >= rows.length) {
    return;
  }
  const a = rows[idx];
  const b = rows[swapWith];
  const u1 = await supabase
    .from("product_images")
    .update({ sort_order: b.sort_order })
    .eq("id", a.id)
    .eq("product_id", params.productId);
  if (u1.error) {
    throw new Error(u1.error.message);
  }
  const u2 = await supabase
    .from("product_images")
    .update({ sort_order: a.sort_order })
    .eq("id", b.id)
    .eq("product_id", params.productId);
  if (u2.error) {
    throw new Error(u2.error.message);
  }
}
