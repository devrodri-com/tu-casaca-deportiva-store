"use client";

import type { Product } from "@/modules/catalog";

export type ProductFormFieldValues = {
  title: string;
  slug: string;
  audience: "adult" | "kids";
  productType: Product["productType"];
  entitySlug: string;
  entityName: string;
  entityKind: Product["entity"]["kind"];
  era: Product["era"];
  supportsCustomization: boolean;
  /** Campo de texto; vacio si no aplica */
  customizationSurcharge: string;
};

const emptyValues: ProductFormFieldValues = {
  title: "",
  slug: "",
  audience: "adult",
  productType: "football_jersey",
  entitySlug: "",
  entityName: "",
  entityKind: "club",
  era: "current",
  supportsCustomization: false,
  customizationSurcharge: "",
};

export function productToFormValues(product: Product): ProductFormFieldValues {
  return {
    title: product.title,
    slug: product.slug,
    audience: product.audience,
    productType: product.productType,
    entitySlug: product.entity.slug,
    entityName: product.entity.name,
    entityKind: product.entity.kind,
    era: product.era,
    supportsCustomization: product.supportsCustomization,
    customizationSurcharge:
      product.customizationSurcharge !== null
        ? String(product.customizationSurcharge)
        : "",
  };
}

type ProductFormFieldsProps = {
  values?: ProductFormFieldValues;
};

export function ProductFormFields({ values = emptyValues }: ProductFormFieldsProps) {
  return (
    <div className="flex flex-col gap-3">
      <label className="flex flex-col gap-1 text-sm text-foreground">
        Titulo
        <input
          name="title"
          className="tcds-input"
          defaultValue={values.title}
          required
        />
      </label>
      <label className="flex flex-col gap-1 text-sm text-foreground">
        Slug (URL)
        <input
          name="slug"
          className="tcds-input"
          defaultValue={values.slug}
          required
        />
      </label>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm text-foreground">
          Tipo
          <select
            name="productType"
            className="tcds-input"
            defaultValue={values.productType}
          >
            <option value="football_jersey">Camiseta de futbol</option>
            <option value="nba_jersey">Camiseta de basquet (NBA)</option>
            <option value="jacket">Campera</option>
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm text-foreground">
          Audiencia
          <select
            name="audience"
            className="tcds-input"
            defaultValue={values.audience}
          >
            <option value="adult">Adulto</option>
            <option value="kids">Niños</option>
          </select>
        </label>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm text-foreground">
          Slug de entidad
          <input
            name="entitySlug"
            className="tcds-input"
            defaultValue={values.entitySlug}
            required
          />
        </label>
        <label className="flex flex-col gap-1 text-sm text-foreground">
          Nombre de entidad
          <input
            name="entityName"
            className="tcds-input"
            defaultValue={values.entityName}
            required
          />
        </label>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm text-foreground">
          Tipo de entidad
          <select
            name="entityKind"
            className="tcds-input"
            defaultValue={values.entityKind}
          >
            <option value="club">Club</option>
            <option value="national_team">Seleccion</option>
            <option value="franchise">Franquicia (NBA / liga)</option>
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm text-foreground">
          Era
          <select name="era" className="tcds-input" defaultValue={values.era}>
            <option value="current">Actual</option>
            <option value="retro">Retro</option>
          </select>
        </label>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm text-foreground">
          Personalizacion
          <select
            name="supportsCustomization"
            className="tcds-input"
            defaultValue={values.supportsCustomization ? "true" : "false"}
          >
            <option value="false">No</option>
            <option value="true">Si</option>
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm text-foreground">
          Recargo personalizacion (si aplica)
          <input
            name="customizationSurcharge"
            className="tcds-input"
            type="number"
            min={0}
            step="0.01"
            defaultValue={values.customizationSurcharge}
            placeholder="0"
          />
        </label>
      </div>
    </div>
  );
}
