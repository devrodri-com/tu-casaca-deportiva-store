"use client";

import { useActionState } from "react";
import { createProductAction, type AdminFormState } from "../actions";
import { ProductFormFields } from "./product-form-fields";

export function CreateProductForm() {
  const [state, formAction, pending] = useActionState<AdminFormState, FormData>(
    createProductAction,
    null
  );
  return (
    <form action={formAction} className="tcds-card flex flex-col gap-4 p-4">
      {state?.error ? (
        <p className="text-sm font-medium text-red-600">{state.error}</p>
      ) : null}
      <ProductFormFields />
      <div className="rounded border border-border bg-surface/50 p-3">
        <label className="flex flex-col gap-1 text-sm text-foreground">
          Precio inicial (talles S a XXL)
          <input
            name="initialAdultVariantPrice"
            className="tcds-input"
            type="number"
            min={0}
            step="0.01"
            placeholder="Ej. 15000"
          />
        </label>
        <p className="mt-2 text-xs text-muted-foreground">
          Obligatorio si la audiencia es <strong>Adulto</strong>: se crean automaticamente S, M, L,
          XL y XXL con este precio y sin disponibilidad hasta que cargues stock o encargo. No aplica
          a <strong>Niños</strong>.
        </p>
      </div>
      <button type="submit" className="tcds-btn-primary w-fit" disabled={pending}>
        {pending ? "Creando…" : "Crear producto"}
      </button>
    </form>
  );
}
