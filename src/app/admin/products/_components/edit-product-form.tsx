"use client";

import { useActionState } from "react";
import type { Product } from "@/modules/catalog";
import { updateProductAction, type AdminFormState } from "../actions";
import { productToFormValues, ProductFormFields } from "./product-form-fields";
import { AdminFormSection } from "./admin-form-section";

type EditProductFormProps = {
  product: Product;
};

export function EditProductForm({ product }: EditProductFormProps) {
  const bound = updateProductAction.bind(null, product.id);
  const [state, formAction, pending] = useActionState<AdminFormState, FormData>(
    bound,
    null
  );
  return (
    <form action={formAction} className="flex flex-col gap-3">
      {state?.error ? (
        <p
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
          role="alert"
        >
          {state.error}
        </p>
      ) : null}
      {state?.success ? (
        <p
          className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800"
          role="status"
        >
          {state.success}
        </p>
      ) : null}
      <AdminFormSection
        title="Datos del producto"
        description="Cambios en titulo, slug, entidad o personalizacion. Guardar actualiza la ficha en la tienda."
        footer={
          <button type="submit" className="tcds-btn-primary w-full sm:w-auto" disabled={pending}>
            {pending ? "Guardando…" : "Guardar producto"}
          </button>
        }
      >
        <ProductFormFields values={productToFormValues(product)} />
      </AdminFormSection>
    </form>
  );
}
