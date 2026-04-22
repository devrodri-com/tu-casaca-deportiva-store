"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  parseAndValidateCreateProductFormData,
  parseAndValidateProductFormData,
  parseAndValidateVariantFormData,
} from "@/modules/catalog/admin/catalog-admin-validation";
import {
  createCatalogProduct,
  createCatalogVariant,
  updateCatalogProduct,
  updateCatalogVariant,
} from "@/modules/catalog/infrastructure/catalog-store";

export type AdminFormState = { error?: string; success?: string } | null;

export async function createProductAction(
  _prev: AdminFormState,
  formData: FormData
): Promise<AdminFormState> {
  const parsed = parseAndValidateCreateProductFormData(formData);
  if (!parsed.ok) {
    return { error: parsed.error };
  }
  const { initialAdultVariantPrice, ...productInput } = parsed.value;
  let newId: string;
  try {
    const r = await createCatalogProduct(
      productInput,
      initialAdultVariantPrice !== null
        ? { initialAdultVariantPrice }
        : undefined
    );
    newId = r.id;
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Error al crear el producto" };
  }
  revalidatePath("/admin/products");
  redirect(`/admin/products/${newId}`);
}

export async function updateProductAction(
  productId: string,
  _prev: AdminFormState,
  formData: FormData
): Promise<AdminFormState> {
  const parsed = parseAndValidateProductFormData(formData);
  if (!parsed.ok) {
    return { error: parsed.error };
  }
  try {
    await updateCatalogProduct(productId, parsed.value);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Error al guardar" };
  }
  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${productId}`);
  return { success: "Cambios guardados" };
}

export async function createVariantAction(
  productId: string,
  _prev: AdminFormState,
  formData: FormData
): Promise<AdminFormState> {
  const parsed = parseAndValidateVariantFormData(formData);
  if (!parsed.ok) {
    return { error: parsed.error };
  }
  try {
    await createCatalogVariant({ productId, input: parsed.value });
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Error al crear la variante" };
  }
  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${productId}`);
  return { success: "Variante creada" };
}

export async function updateVariantAction(
  productId: string,
  variantId: string,
  _prev: AdminFormState,
  formData: FormData
): Promise<AdminFormState> {
  const parsed = parseAndValidateVariantFormData(formData);
  if (!parsed.ok) {
    return { error: parsed.error };
  }
  try {
    await updateCatalogVariant({
      productId,
      variantId,
      input: parsed.value,
    });
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Error al guardar la variante" };
  }
  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${productId}`);
  return { success: "Variante actualizada" };
}
