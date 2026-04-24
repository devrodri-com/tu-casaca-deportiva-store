"use client";

import { useActionState } from "react";
import { adminAlert } from "@/app/admin/_lib/admin-ui-classes";
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
        <p
          className={`rounded-md px-3 py-2 text-sm font-medium ${adminAlert.error}`}
          role="alert"
        >
          {state.error}
        </p>
      ) : null}
      {state?.success ? (
        <p
          className={`rounded-md px-3 py-2 text-sm font-medium ${adminAlert.success}`}
          role="status"
        >
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
