"use client";

import { useActionState } from "react";
import type { CatalogProductImageRow } from "@/modules/catalog/infrastructure/product-images-store";
import type { AdminFormState } from "../actions";
import {
  mutateProductImageAction,
  uploadProductImageAction,
} from "../product-image-actions";

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
    <section className="tcds-card flex flex-col gap-4 p-4">
      <div>
        <h2 className="text-sm font-semibold text-foreground">Imagenes del producto</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          JPG, PNG o WebP hasta 5 MB. La primera imagen es principal automaticamente; podés
          cambiarla cuando quieras.
        </p>
      </div>

      {message ? (
        <p
          className={`text-sm font-medium ${isError ? "text-red-600" : "text-emerald-800"}`}
          role={isError ? "alert" : "status"}
        >
          {message}
        </p>
      ) : null}

      <form action={uploadAction} className="flex flex-col gap-2 border-b border-border pb-4">
        <input type="hidden" name="productId" value={productId} />
        <label className="text-xs font-medium text-foreground">
          Subir imagen
          <input
            type="file"
            name="file"
            required
            accept="image/jpeg,image/jpg,image/png,image/webp"
            className="mt-1 block w-full max-w-md text-sm"
            disabled={pending}
          />
        </label>
        <label className="text-xs font-medium text-foreground">
          Texto alternativo (opcional)
          <input
            type="text"
            name="altText"
            className="mt-1 block w-full max-w-md rounded border border-border px-2 py-1 text-sm"
            placeholder="Descripcion breve"
            disabled={pending}
          />
        </label>
        <button type="submit" className="tcds-btn-secondary w-fit text-sm" disabled={pending}>
          {uploadPending ? "Subiendo…" : "Subir"}
        </button>
      </form>

      {images.length === 0 ? (
        <p className="text-sm text-muted-foreground">Todavia no hay imagenes.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {images.map((img, index) => (
            <li
              key={img.id}
              className="flex flex-wrap items-start gap-3 rounded-md border border-border bg-surface/40 p-3"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.publicUrl}
                alt={img.altText ?? ""}
                className="h-20 w-20 shrink-0 rounded object-cover"
                width={80}
                height={80}
              />
              <div className="flex min-w-0 flex-1 flex-col gap-1 text-xs">
                <p className="font-mono text-[10px] text-muted-foreground break-all">
                  {img.storagePath}
                </p>
                <p className="text-foreground">
                  Orden: {img.sortOrder}
                  {img.isPrimary ? (
                    <span className="ml-2 rounded bg-sky-100 px-1.5 py-0.5 text-sky-900">
                      Principal
                    </span>
                  ) : null}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {!img.isPrimary ? (
                  <form action={mutAction}>
                    <input type="hidden" name="_op" value="set_primary" />
                    <input type="hidden" name="productId" value={productId} />
                    <input type="hidden" name="imageId" value={img.id} />
                    <button
                      type="submit"
                      className="tcds-btn-secondary text-xs"
                      disabled={pending}
                    >
                      Marcar principal
                    </button>
                  </form>
                ) : null}
                <form action={mutAction}>
                  <input type="hidden" name="_op" value="move_up" />
                  <input type="hidden" name="productId" value={productId} />
                  <input type="hidden" name="imageId" value={img.id} />
                  <button
                    type="submit"
                    className="tcds-btn-secondary text-xs"
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
                    className="tcds-btn-secondary text-xs"
                    disabled={pending || index === images.length - 1}
                    title="Bajar en el orden"
                  >
                    Abajo
                  </button>
                </form>
                <form action={mutAction}>
                  <input type="hidden" name="_op" value="delete" />
                  <input type="hidden" name="productId" value={productId} />
                  <input type="hidden" name="imageId" value={img.id} />
                  <button
                    type="submit"
                    className="rounded border border-red-200 bg-red-50 px-2 py-1 text-xs font-medium text-red-800 hover:bg-red-100"
                    disabled={pending}
                  >
                    Eliminar
                  </button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
