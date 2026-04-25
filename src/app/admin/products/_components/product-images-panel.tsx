"use client";

import { useActionState } from "react";
import { adminAlert, adminChip } from "@/app/admin/_lib/admin-ui-classes";
import type { CatalogProductImageRow } from "@/modules/catalog/infrastructure/product-images-store";
import type { AdminFormState } from "../actions";
import {
  mutateProductImageAction,
  uploadProductImageAction,
} from "../product-image-actions";
import { AdminFormSection } from "./admin-form-section";

type ProductImagesPanelProps = {
  productId: string;
  images: CatalogProductImageRow[];
};

export function ProductImagesPanel({ productId, images }: ProductImagesPanelProps) {
  const [uploadState, uploadAction, uploadPending] = useActionState<
    AdminFormState,
    FormData
  >(uploadProductImageAction, null);
  const [mutState, mutAction, mutPending] = useActionState<AdminFormState, FormData>(
    mutateProductImageAction,
    null
  );
  const pending = uploadPending || mutPending;
  const message = uploadState?.error ?? mutState?.error ?? uploadState?.success ?? mutState?.success;
  const isError = Boolean(uploadState?.error ?? mutState?.error);

  return (
    <AdminFormSection
      title="Imágenes del producto"
      description="JPG, PNG o WebP hasta 5 MB. Orden = galeria en la tienda; la principal se usa como portada. Alt mejora accesibilidad y SEO."
    >
      {message ? (
        <p
          className={`mb-4 rounded-md px-3 py-2 text-sm font-medium ${
            isError ? adminAlert.error : adminAlert.success
          }`}
          role={isError ? "alert" : "status"}
        >
          {message}
        </p>
      ) : null}

      <form
        action={uploadAction}
        className="flex flex-col gap-4 rounded-lg border border-border bg-surface/20 p-3.5 dark:border-white/10 dark:bg-neutral-900/20"
      >
        <input type="hidden" name="productId" value={productId} />
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Subir nueva
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            La imagen marcada como principal se usa como portada. El orden define la galería en la tienda.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 sm:items-end">
          <label className="flex flex-col gap-1.5 text-sm text-foreground">
            <span className="text-xs font-medium">Archivo</span>
            <input
              type="file"
              name="file"
              required
              accept="image/jpeg,image/jpg,image/png,image/webp"
              className="tcds-input cursor-pointer file:mr-3 file:rounded file:border-0 file:bg-surface file:px-2 file:py-1.5 file:text-sm file:dark:bg-neutral-800"
              disabled={pending}
            />
          </label>
          <label className="flex flex-col gap-1.5 text-sm text-foreground">
            <span className="text-xs font-medium">Texto alternativo (opcional)</span>
            <input
              type="text"
              name="altText"
              className="tcds-input"
              placeholder="Descripcion breve"
              disabled={pending}
            />
          </label>
        </div>
        <button type="submit" className="tcds-btn-primary w-fit" disabled={pending}>
          {uploadPending ? "Subiendo…" : "Subir imagen"}
        </button>
      </form>

      {images.length === 0 ? (
        <p className="pt-2 text-sm text-muted-foreground">Todavia no hay imagenes.</p>
      ) : (
        <div className="mt-4 space-y-2">
          <p className="text-xs text-muted-foreground">
            Ordená con <span className="font-medium text-foreground">Arriba/Abajo</span>.{" "}
            <span className="font-medium text-foreground">Eliminar</span> quita la imagen del producto de forma
            definitiva.
          </p>
          <ul className="flex flex-col gap-3">
          {images.map((img, index) => (
            <li
              key={img.id}
              className="flex flex-col gap-3 rounded-lg border border-border bg-surface/30 p-3.5 sm:flex-row sm:items-stretch dark:border-white/10"
            >
              <div className="flex shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.publicUrl}
                  alt={img.altText ?? ""}
                  className="h-24 w-24 rounded-md border border-border object-cover"
                  width={96}
                  height={96}
                />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  {img.isPrimary ? (
                    <span
                      className={`inline-flex rounded-md px-2 py-0.5 text-xs font-semibold ${adminChip.sky}`}
                    >
                      Principal (portada)
                    </span>
                  ) : null}
                  <span className="text-xs text-muted-foreground">Orden galería: {img.sortOrder}</span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {img.altText?.trim() ? `Alt: ${img.altText}` : "Alt: sin descripción"}
                </p>
                <p
                  className="mt-1 font-mono text-[10px] text-muted-foreground break-all"
                  title={img.storagePath}
                >
                  {img.storagePath}
                </p>
              </div>
              <div className="flex w-full flex-col gap-2 border-t border-border pt-3 sm:w-52 sm:border-l sm:border-t-0 sm:pl-3 sm:pt-0">
                <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground sm:sr-only">
                  Acciones
                </p>
                <div className="flex flex-col gap-1.5">
                  {!img.isPrimary ? (
                    <form action={mutAction} className="w-full">
                      <input type="hidden" name="_op" value="set_primary" />
                      <input type="hidden" name="productId" value={productId} />
                      <input type="hidden" name="imageId" value={img.id} />
                      <button
                        type="submit"
                        className="tcds-btn-secondary w-full px-2 py-1.5 text-xs"
                        disabled={pending}
                      >
                        Marcar principal
                      </button>
                    </form>
                  ) : null}
                  <div className="grid grid-cols-2 gap-1.5">
                    <form action={mutAction}>
                      <input type="hidden" name="_op" value="move_up" />
                      <input type="hidden" name="productId" value={productId} />
                      <input type="hidden" name="imageId" value={img.id} />
                      <button
                        type="submit"
                        className="tcds-btn-secondary w-full px-2 py-1.5 text-xs"
                        disabled={pending || index === 0}
                        title="Subir en el orden"
                      >
                        Arriba
                      </button>
                    </form>
                    <form action={mutAction}>
                      <input type="hidden" name="_op" value="move_down" />
                      <input type="hidden" name="productId" value={productId} />
                      <input type="hidden" name="imageId" value={img.id} />
                      <button
                        type="submit"
                        className="tcds-btn-secondary w-full px-2 py-1.5 text-xs"
                        disabled={pending || index === images.length - 1}
                        title="Bajar en el orden"
                      >
                        Abajo
                      </button>
                    </form>
                  </div>
                  <form action={mutAction} className="w-full">
                    <input type="hidden" name="_op" value="delete" />
                    <input type="hidden" name="productId" value={productId} />
                    <input type="hidden" name="imageId" value={img.id} />
                    <button
                      type="submit"
                      className="w-full rounded-md border border-red-200 bg-red-50 px-2 py-1.5 text-xs font-medium text-red-800 transition hover:bg-red-100 dark:border-red-800/50 dark:bg-red-950/30 dark:text-red-200 dark:hover:bg-red-950/50"
                      disabled={pending}
                      title="Acción destructiva"
                    >
                      Eliminar
                    </button>
                  </form>
                </div>
              </div>
            </li>
          ))}
          </ul>
        </div>
      )}
    </AdminFormSection>
  );
}
