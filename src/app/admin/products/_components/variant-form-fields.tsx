"use client";

import type { CatalogVariantRecord } from "@/modules/catalog/infrastructure/catalog-mappers";

export type VariantFormFieldValues = {
  size: string;
  unitBasePrice: string;
  expressStock: string;
  allowMadeToOrder: boolean;
  madeToOrderMinDays: string;
  madeToOrderMaxDays: string;
};

const emptyVariant: VariantFormFieldValues = {
  size: "",
  unitBasePrice: "",
  expressStock: "0",
  allowMadeToOrder: false,
  madeToOrderMinDays: "",
  madeToOrderMaxDays: "",
};

export function variantToFormValues(
  record: CatalogVariantRecord
): VariantFormFieldValues {
  return {
    size: record.variant.size,
    unitBasePrice: String(record.unitBasePrice),
    expressStock: String(record.variant.expressStock),
    allowMadeToOrder: record.variant.allowMadeToOrder,
    madeToOrderMinDays:
      record.variant.madeToOrderMinDays !== null
        ? String(record.variant.madeToOrderMinDays)
        : "",
    madeToOrderMaxDays:
      record.variant.madeToOrderMaxDays !== null
        ? String(record.variant.madeToOrderMaxDays)
        : "",
  };
}

type VariantFormFieldsProps = {
  values?: VariantFormFieldValues;
};

/** Mismo conjunto de campos para crear o editar variante (un form por variante; nombres fijos). */
export function VariantFormFields({ values = emptyVariant }: VariantFormFieldsProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <label className="flex flex-col gap-1 text-sm text-foreground sm:col-span-2">
        Talle
        <input
          name="size"
          className="tcds-input"
          defaultValue={values.size}
          required
        />
      </label>
      <label className="flex flex-col gap-1 text-sm text-foreground">
        Precio base (unidad)
        <input
          name="unitBasePrice"
          className="tcds-input"
          type="number"
          min={0}
          step="0.01"
          defaultValue={values.unitBasePrice}
          required
        />
      </label>
      <label className="flex flex-col gap-1 text-sm text-foreground">
        Stock express
        <input
          name="expressStock"
          className="tcds-input"
          type="number"
          min={0}
          step={1}
          defaultValue={values.expressStock}
          required
        />
      </label>
      <label className="flex flex-col gap-1 text-sm text-foreground sm:col-span-2">
        Encargo
        <select
          name="allowMadeToOrder"
          className="tcds-input"
          defaultValue={values.allowMadeToOrder ? "true" : "false"}
        >
          <option value="false">Solo con stock (sin encargo)</option>
          <option value="true">Permite encargo</option>
        </select>
      </label>
      <label className="flex flex-col gap-1 text-sm text-foreground">
        Dias min (encargo)
        <input
          name="madeToOrderMinDays"
          className="tcds-input"
          type="number"
          min={1}
          step={1}
          defaultValue={values.madeToOrderMinDays}
        />
      </label>
      <label className="flex flex-col gap-1 text-sm text-foreground">
        Dias max (encargo)
        <input
          name="madeToOrderMaxDays"
          className="tcds-input"
          type="number"
          min={1}
          step={1}
          defaultValue={values.madeToOrderMaxDays}
        />
      </label>
    </div>
  );
}
