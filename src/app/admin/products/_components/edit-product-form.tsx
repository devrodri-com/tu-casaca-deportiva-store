"use client";

import { useActionState } from "react";
import { adminAlert } from "@/app/admin/_lib/admin-ui-classes";
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
          className={`rounded-lg px-4 py-3 text-sm font-medium ${adminAlert.error}`}
          role="alert"
        >
          {state.error}
        </p>
      ) : null}
      {state?.success ? (
        <p
          className={`rounded-lg px-4 py-3 text-sm font-medium ${adminAlert.success}`}
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
