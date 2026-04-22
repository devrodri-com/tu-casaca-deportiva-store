"use client";

import { useActionState } from "react";
import { createVariantAction, type AdminFormState } from "../actions";
import { VariantFormFields } from "./variant-form-fields";

type CreateVariantFormProps = {
  productId: string;
};

export function CreateVariantForm({ productId }: CreateVariantFormProps) {
  const bound = createVariantAction.bind(null, productId);
  const [state, formAction, pending] = useActionState<AdminFormState, FormData>(
    bound,
    null
  );
  return (
    <form action={formAction} className="tcds-card flex flex-col gap-3 p-4">
      <h2 className="text-sm font-semibold text-foreground">Nueva variante</h2>
      {state?.error ? (
        <p className="text-sm font-medium text-red-600">{state.error}</p>
      ) : null}
      {state?.success ? (
        <p className="text-sm font-medium text-emerald-800">{state.success}</p>
      ) : null}
      <VariantFormFields />
      <button type="submit" className="tcds-btn-primary w-fit" disabled={pending}>
        {pending ? "Creando…" : "Agregar variante"}
      </button>
    </form>
  );
}
