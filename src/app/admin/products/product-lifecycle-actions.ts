"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  deleteCatalogProductSafely,
  setCatalogProductActiveState,
} from "@/modules/catalog/infrastructure/catalog-store";
import { getProductSlugByProductId } from "@/modules/catalog/infrastructure/product-images-store";
import type { AdminFormState } from "./actions";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isUuid(value: string): boolean {
  return UUID_RE.test(value);
}

export async function setProductActiveAction(
  _prev: AdminFormState,
  formData: FormData
): Promise<AdminFormState> {
  const productId = String(formData.get("productId") ?? "");
  const targetRaw = String(formData.get("targetActive") ?? "");
  if (!isUuid(productId)) {
    return { error: "Producto invalido" };
  }
  if (targetRaw !== "true" && targetRaw !== "false") {
    return { error: "Estado invalido" };
  }
  try {
    await setCatalogProductActiveState({
      productId,
      isActive: targetRaw === "true",
    });
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Error al actualizar" };
  }
  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${productId}`);
  revalidatePath("/products");
  const slug = await getProductSlugByProductId(productId);
  if (slug) {
    revalidatePath(`/products/${slug}`);
  }
  return { success: "Estado actualizado" };
}

export async function deleteProductPermanentlyAction(
  _prev: AdminFormState,
  formData: FormData
): Promise<AdminFormState> {
  const productId = String(formData.get("productId") ?? "");
  if (!isUuid(productId)) {
    return { error: "Producto invalido" };
  }
  let slugForRevalidate: string | null = null;
  try {
    slugForRevalidate = await getProductSlugByProductId(productId);
    await deleteCatalogProductSafely({ productId });
  } catch (e) {
    return {
      error: e instanceof Error ? e.message : "No se pudo eliminar el producto",
    };
  }
  revalidatePath("/admin/products");
  revalidatePath("/products");
  if (slugForRevalidate) {
    revalidatePath(`/products/${slugForRevalidate}`);
  }
  redirect("/admin/products");
}
