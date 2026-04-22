"use client";

import { useActionState } from "react";
import type { Product } from "@/modules/catalog";
import { updateProductAction, type AdminFormState } from "../actions";
import { productToFormValues, ProductFormFields } from "./product-form-fields";

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
    <form action={formAction} className="tcds-card flex flex-col gap-4 p-4">
      {state?.error ? (
        <p className="text-sm font-medium text-red-600">{state.error}</p>
      ) : null}
      {state?.success ? (
        <p className="text-sm font-medium text-emerald-800">{state.success}</p>
      ) : null}
      <ProductFormFields values={productToFormValues(product)} />
      <button type="submit" className="tcds-btn-primary w-fit" disabled={pending}>
        {pending ? "Guardando…" : "Guardar producto"}
      </button>
    </form>
  );
}
