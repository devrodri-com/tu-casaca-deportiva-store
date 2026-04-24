"use client";

import { useActionState } from "react";
import { adminAlert } from "@/app/admin/_lib/admin-ui-classes";
import { createProductAction, type AdminFormState } from "../actions";
import { ProductFormFields } from "./product-form-fields";
import { AdminFormSection } from "./admin-form-section";

export function CreateProductForm() {
  const [state, formAction, pending] = useActionState<AdminFormState, FormData>(
    createProductAction,
    null
  );
  return (
    <form action={formAction} className="flex flex-col gap-4">
      {state?.error ? (
        <p
          className={`rounded-lg px-4 py-3 text-sm font-medium ${adminAlert.error}`}
          role="alert"
        >
          {state.error}
        </p>
      ) : null}
      <AdminFormSection
        title="Datos del producto"
        description="Identidad, entidad, audiencia y opciones de personalizacion. El slug define la URL en la tienda."
        footer={
          <button type="submit" className="tcds-btn-primary w-full sm:w-auto" disabled={pending}>
            {pending ? "Creando…" : "Crear producto"}
          </button>
        }
      >
        <div className="flex flex-col gap-6">
          <ProductFormFields />
          <div className="rounded-lg border border-border bg-surface/50 p-4 dark:border-white/10">
            <label className="flex flex-col gap-2 text-sm text-foreground">
              <span className="text-xs font-medium">Precio inicial (talles S a XXL)</span>
              <input
                name="initialAdultVariantPrice"
                className="tcds-input max-w-md"
                type="number"
                min={0}
                step="0.01"
                placeholder="Ej. 15000"
              />
            </label>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              <strong className="font-medium text-foreground">Obligatorio si la audiencia es Adulto:</strong> se crean
              automaticamente S, M, L, XL y XXL con este precio, sin stock hasta que cargues express o
              encargo. <strong className="font-medium text-foreground">No aplica a Niños.</strong>
            </p>
          </div>
        </div>
      </AdminFormSection>
    </form>
  );
}
