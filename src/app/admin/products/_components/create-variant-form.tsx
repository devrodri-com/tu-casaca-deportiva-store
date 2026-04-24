"use client";

import { useActionState } from "react";
import { createVariantAction, type AdminFormState } from "../actions";
import { VariantFormFields } from "./variant-form-fields";

type CreateVariantFormProps = {
  productId: string;
  /** Sin tarjeta propia: para usar dentro de `AdminFormSection` */
  embed?: boolean;
};

export function CreateVariantForm({ productId, embed = false }: CreateVariantFormProps) {
  const bound = createVariantAction.bind(null, productId);
  const [state, formAction, pending] = useActionState<AdminFormState, FormData>(
    bound,
    null
  );
  return (
    <form
      action={formAction}
      className={embed ? "flex flex-col gap-4" : "tcds-card flex flex-col gap-4 p-4 md:p-5"}
    >
      {embed ? null : (
        <h2 className="text-sm font-semibold text-foreground">Nueva variante</h2>
      )}
      {state?.error ? (
        <p className="text-sm font-medium text-red-600" role="alert">
          {state.error}
        </p>
      ) : null}
      {state?.success ? (
        <p className="text-sm font-medium text-emerald-800" role="status">
          {state.success}
        </p>
      ) : null}
      <VariantFormFields />
      <div className="flex flex-col justify-end sm:flex-row">
        <button type="submit" className="tcds-btn-primary w-full sm:w-auto" disabled={pending}>
          {pending ? "Creando…" : "Agregar variante"}
        </button>
      </div>
    </form>
  );
}
