"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { validateProductImageFile } from "@/modules/catalog/admin/product-image-upload";
import { getCatalogProductWithVariantsById } from "@/modules/catalog/infrastructure/catalog-store";
import {
  countProductImages,
  deleteProductImageRow,
  getNextProductImageSortOrder,
  getProductSlugByProductId,
  insertProductImageMetadata,
  moveProductImageSort,
  setProductImagePrimary,
} from "@/modules/catalog/infrastructure/product-images-store";
import {
  removeProductImageObject,
  uploadProductImageObject,
} from "@/modules/catalog/infrastructure/product-images-storage";
import type { AdminFormState } from "./actions";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isUuid(value: string): boolean {
  return UUID_RE.test(value);
}

async function revalidateProductImagePaths(productId: string): Promise<void> {
  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${productId}`);
  revalidatePath("/products");
  const slug = await getProductSlugByProductId(productId);
  if (slug) {
    revalidatePath(`/products/${slug}`);
  }
}

export async function uploadProductImageAction(
  _prev: AdminFormState,
  formData: FormData
): Promise<AdminFormState> {
  const productId = String(formData.get("productId") ?? "");
  if (!isUuid(productId)) {
    return { error: "Producto invalido" };
  }
  const product = await getCatalogProductWithVariantsById(productId);
  if (!product) {
    return { error: "El producto no existe" };
  }
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return { error: "Seleccioná un archivo de imagen" };
  }
  const validated = await validateProductImageFile(file);
  if (!validated.ok) {
    return { error: validated.error };
  }
  const altRaw = String(formData.get("altText") ?? "").trim();
  const altText = altRaw.length > 0 ? altRaw : null;
  const storagePath = `${productId}/${randomUUID()}.${validated.value.extension}`;
  const sortOrder = await getNextProductImageSortOrder(productId);
  const existingCount = await countProductImages(productId);
  const isPrimary = existingCount === 0;
  try {
    await uploadProductImageObject({
      storagePath,
      bytes: validated.value.buffer,
      contentType: validated.value.contentType,
    });
    await insertProductImageMetadata({
      productId,
      storagePath,
      altText,
      isPrimary,
      sortOrder,
    });
  } catch (e) {
    try {
      await removeProductImageObject(storagePath);
    } catch {
      /* ignore cleanup failure */
    }
    return { error: e instanceof Error ? e.message : "Error al subir la imagen" };
  }
  await revalidateProductImagePaths(productId);
  return { success: "Imagen subida" };
}

export async function mutateProductImageAction(
  _prev: AdminFormState,
  formData: FormData
): Promise<AdminFormState> {
  const op = String(formData.get("_op") ?? "");
  const productId = String(formData.get("productId") ?? "");
  const imageId = String(formData.get("imageId") ?? "");
  if (!isUuid(productId) || !isUuid(imageId)) {
    return { error: "Datos invalidos" };
  }
  const product = await getCatalogProductWithVariantsById(productId);
  if (!product) {
    return { error: "El producto no existe" };
  }
  try {
    if (op === "set_primary") {
      await setProductImagePrimary({ productId, imageId });
    } else if (op === "delete") {
      const removed = await deleteProductImageRow({ productId, imageId });
      if (!removed) {
        return { error: "Imagen no encontrada" };
      }
    } else if (op === "move_up") {
      await moveProductImageSort({ productId, imageId, direction: "up" });
    } else if (op === "move_down") {
      await moveProductImageSort({ productId, imageId, direction: "down" });
    } else {
      return { error: "Operacion desconocida" };
    }
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Error al actualizar imagenes" };
  }
  await revalidateProductImagePaths(productId);
  return { success: "Imagenes actualizadas" };
}
