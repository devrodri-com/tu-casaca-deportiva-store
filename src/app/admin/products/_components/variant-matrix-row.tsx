"use client";

import { useActionState } from "react";
import type { CatalogAvailability } from "@/modules/catalog";
import { labelVariantAvailability } from "@/modules/catalog/admin/variant-availability-label";
import type { CatalogVariantRecord } from "@/modules/catalog/infrastructure/catalog-mappers";
import { updateVariantAction, type AdminFormState } from "../actions";
import { variantToFormValues } from "./variant-form-fields";

type VariantMatrixRowProps = {
  productId: string;
  record: CatalogVariantRecord;
  availability: CatalogAvailability;
};

function availabilityChipClass(availability: CatalogAvailability): string {
  switch (availability) {
    case "express":
      return "border-emerald-200 bg-emerald-50 text-emerald-900";
    case "made_to_order":
      return "border-sky-200 bg-sky-50 text-sky-900";
    case "unavailable":
      return "border-neutral-200 bg-neutral-100 text-neutral-700";
  }
}

export function VariantMatrixRow({ productId, record, availability }: VariantMatrixRowProps) {
  const v = variantToFormValues(record);
  const bound = updateVariantAction.bind(null, productId, record.variant.id);
  const [state, formAction, pending] = useActionState<AdminFormState, FormData>(
    bound,
    null
  );
  const availabilityLabel = labelVariantAvailability(availability);

  return (
    <form
      action={formAction}
      className="grid grid-cols-1 gap-3 border-b border-border p-3 last:border-0 sm:grid-cols-2 sm:gap-2 lg:grid-cols-12 lg:items-end lg:gap-2 lg:px-2"
    >
      {state?.error ? (
        <p className="text-sm font-medium text-red-600 sm:col-span-2 lg:col-span-12">{state.error}</p>
      ) : null}
      {state?.success ? (
        <p className="text-sm text-emerald-800 sm:col-span-2 lg:col-span-12">{state.success}</p>
      ) : null}
      <label className="flex flex-col gap-1 text-xs text-foreground lg:col-span-1">
        <span className="font-medium">Talle</span>
        <input name="size" className="tcds-input" defaultValue={v.size} required />
      </label>
      <label className="flex flex-col gap-1 text-xs text-foreground lg:col-span-2">
        <span className="font-medium">Precio u.</span>
        <input
          name="unitBasePrice"
          className="tcds-input"
          type="number"
          min={0}
          step="0.01"
          defaultValue={v.unitBasePrice}
          required
        />
      </label>
      <label className="flex flex-col gap-1 text-xs text-foreground lg:col-span-1">
        <span className="font-medium">Stock exp.</span>
        <input
          name="expressStock"
          className="tcds-input"
          type="number"
          min={0}
          step={1}
          defaultValue={v.expressStock}
          required
        />
      </label>
      <label className="flex flex-col gap-1 text-xs text-foreground lg:col-span-2">
        <span className="font-medium">Encargo</span>
        <select
          name="allowMadeToOrder"
          className="tcds-input"
          defaultValue={v.allowMadeToOrder ? "true" : "false"}
        >
          <option value="false">No</option>
          <option value="true">Si</option>
        </select>
      </label>
      <label className="flex flex-col gap-1 text-xs text-foreground lg:col-span-1">
        <span className="font-medium">Min d.</span>
        <input
          name="madeToOrderMinDays"
          className="tcds-input"
          type="number"
          min={1}
          step={1}
          defaultValue={v.madeToOrderMinDays}
        />
      </label>
      <label className="flex flex-col gap-1 text-xs text-foreground lg:col-span-1">
        <span className="font-medium">Max d.</span>
        <input
          name="madeToOrderMaxDays"
          className="tcds-input"
          type="number"
          min={1}
          step={1}
          defaultValue={v.madeToOrderMaxDays}
        />
      </label>
      <div className="flex flex-col gap-1 pb-0.5 lg:col-span-1">
        <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
          Estado
        </span>
        <span
          className={`inline-flex w-fit max-w-full rounded-md border px-2 py-1 text-xs font-medium ${availabilityChipClass(availability)}`}
        >
          {availabilityLabel}
        </span>
      </div>
      <div className="flex items-end justify-start lg:col-span-2">
        <button
          type="submit"
          className="tcds-btn-secondary w-full min-w-0 sm:w-auto"
          disabled={pending}
        >
          {pending ? "Guardando…" : "Guardar fila"}
        </button>
      </div>
    </form>
  );
}
