"use client";

import { useActionState } from "react";
import type { CatalogVariantRecord } from "@/modules/catalog/infrastructure/catalog-mappers";
import { updateVariantAction, type AdminFormState } from "../actions";
import { variantToFormValues } from "./variant-form-fields";

type VariantMatrixRowProps = {
  productId: string;
  record: CatalogVariantRecord;
  availabilityLabel: string;
};

export function VariantMatrixRow({
  productId,
  record,
  availabilityLabel,
}: VariantMatrixRowProps) {
  const v = variantToFormValues(record);
  const bound = updateVariantAction.bind(null, productId, record.variant.id);
  const [state, formAction, pending] = useActionState<AdminFormState, FormData>(
    bound,
    null
  );

  return (
    <form
      action={formAction}
      className="grid grid-cols-1 gap-2 border-b border-border p-3 last:border-0 sm:grid-cols-2 lg:grid-cols-12 lg:items-end"
    >
      {state?.error ? (
        <p className="text-sm font-medium text-red-600 sm:col-span-2 lg:col-span-12">
          {state.error}
        </p>
      ) : null}
      {state?.success ? (
        <p className="text-sm text-emerald-800 sm:col-span-2 lg:col-span-12">{state.success}</p>
      ) : null}
      <label className="flex flex-col gap-0.5 text-xs text-foreground lg:col-span-1">
        Talle
        <input name="size" className="tcds-input" defaultValue={v.size} required />
      </label>
      <label className="flex flex-col gap-0.5 text-xs text-foreground lg:col-span-2">
        Precio u.
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
      <label className="flex flex-col gap-0.5 text-xs text-foreground lg:col-span-1">
        Stock
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
      <label className="flex flex-col gap-0.5 text-xs text-foreground lg:col-span-2">
        Encargo
        <select
          name="allowMadeToOrder"
          className="tcds-input"
          defaultValue={v.allowMadeToOrder ? "true" : "false"}
        >
          <option value="false">No</option>
          <option value="true">Si</option>
        </select>
      </label>
      <label className="flex flex-col gap-0.5 text-xs text-foreground lg:col-span-1">
        Min
        <input
          name="madeToOrderMinDays"
          className="tcds-input"
          type="number"
          min={1}
          step={1}
          defaultValue={v.madeToOrderMinDays}
        />
      </label>
      <label className="flex flex-col gap-0.5 text-xs text-foreground lg:col-span-1">
        Max
        <input
          name="madeToOrderMaxDays"
          className="tcds-input"
          type="number"
          min={1}
          step={1}
          defaultValue={v.madeToOrderMaxDays}
        />
      </label>
      <div className="flex flex-col justify-end gap-0.5 pb-1 text-xs text-muted-foreground lg:col-span-1">
        <span className="text-[10px] uppercase tracking-wide">Estado</span>
        <span className="font-medium text-foreground">{availabilityLabel}</span>
      </div>
      <div className="flex items-end justify-start lg:col-span-2">
        <button
          type="submit"
          className="tcds-btn-secondary w-full sm:w-auto"
          disabled={pending}
        >
          {pending ? "…" : "Guardar"}
        </button>
      </div>
    </form>
  );
}
