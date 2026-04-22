const ALLOWED = new Map<string, string>([
  ["image/jpeg", "jpg"],
  ["image/jpg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
]);

export const PRODUCT_IMAGE_MAX_BYTES = 5 * 1024 * 1024;

export type ValidatedProductImageFile = {
  buffer: Buffer;
  contentType: string;
  extension: string;
};

export async function validateProductImageFile(
  file: File
): Promise<{ ok: true; value: ValidatedProductImageFile } | { ok: false; error: string }> {
  if (!(file instanceof File)) {
    return { ok: false, error: "Archivo invalido" };
  }
  if (file.size === 0) {
    return { ok: false, error: "El archivo esta vacio" };
  }
  if (file.size > PRODUCT_IMAGE_MAX_BYTES) {
    return { ok: false, error: "La imagen supera el maximo de 5 MB" };
  }
  const extension = ALLOWED.get(file.type);
  if (!extension) {
    return { ok: false, error: "Solo se permiten JPG, PNG o WebP" };
  }
  const buffer = Buffer.from(await file.arrayBuffer());
  return {
    ok: true,
    value: {
      buffer,
      contentType: file.type === "image/jpg" ? "image/jpeg" : file.type,
      extension,
    },
  };
}
