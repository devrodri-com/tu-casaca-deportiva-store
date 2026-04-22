import type { CatalogEntityKind, ProductEra, ProductType } from "@/modules/catalog";
import { isValidMadeToOrderRange } from "@/modules/catalog";
import type { ProductVariant } from "@/modules/catalog/product-variant";

const PRODUCT_TYPES: ProductType[] = ["football_jersey", "nba_jersey", "jacket"];
const ENTITY_KINDS: CatalogEntityKind[] = ["club", "national_team", "franchise"];
const ERAS: ProductEra[] = ["current", "retro"];
const AUDIENCES = ["adult", "kids"] as const;

function parseIntStrict(raw: string, field: string): number | { error: string } {
  const t = raw.trim();
  if (t === "") {
    return { error: `${field} requerido` };
  }
  const n = Number(t);
  if (!Number.isInteger(n)) {
    return { error: `${field} debe ser un entero` };
  }
  return n;
}

function parseNonNegativeInt(
  raw: string,
  field: string
): number | { error: string } {
  const n = parseIntStrict(raw, field);
  if (typeof n === "object" && "error" in n) {
    return n;
  }
  if (n < 0) {
    return { error: `${field} no puede ser negativo` };
  }
  return n;
}

function parseNonNegativeNumber(
  raw: string,
  field: string
): number | { error: string } {
  const t = raw.trim();
  if (t === "") {
    return { error: `${field} es requerido` };
  }
  const n = Number(t);
  if (Number.isNaN(n) || n < 0) {
    return { error: `${field} debe ser un numero >= 0` };
  }
  return n;
}

export type ValidatedProductInput = {
  title: string;
  slug: string;
  audience: "adult" | "kids";
  productType: ProductType;
  entitySlug: string;
  entityName: string;
  entityKind: CatalogEntityKind;
  era: ProductEra;
  supportsCustomization: boolean;
  customizationSurcharge: number | null;
};

export function parseAndValidateProductFormData(
  formData: FormData
): { ok: true; value: ValidatedProductInput } | { ok: false; error: string } {
  const title = String(formData.get("title") ?? "").trim();
  const slug = String(formData.get("slug") ?? "").trim();
  const audienceRaw = String(formData.get("audience") ?? "");
  const productTypeRaw = String(formData.get("productType") ?? "");
  const entitySlug = String(formData.get("entitySlug") ?? "").trim();
  const entityName = String(formData.get("entityName") ?? "").trim();
  const entityKindRaw = String(formData.get("entityKind") ?? "");
  const eraRaw = String(formData.get("era") ?? "");
  const supportsCustomization = String(formData.get("supportsCustomization") ?? "") === "true";
  const surchargeRaw = String(formData.get("customizationSurcharge") ?? "").trim();

  if (title === "") {
    return { ok: false, error: "El titulo es requerido" };
  }
  if (slug === "") {
    return { ok: false, error: "El slug es requerido" };
  }
  if (!AUDIENCES.includes(audienceRaw as "adult" | "kids")) {
    return { ok: false, error: "Audiencia invalida" };
  }
  if (!PRODUCT_TYPES.includes(productTypeRaw as ProductType)) {
    return { ok: false, error: "Tipo de producto invalido" };
  }
  if (entitySlug === "") {
    return { ok: false, error: "entitySlug es requerido" };
  }
  if (entityName === "") {
    return { ok: false, error: "entityName es requerido" };
  }
  if (!ENTITY_KINDS.includes(entityKindRaw as CatalogEntityKind)) {
    return { ok: false, error: "entityKind invalido" };
  }
  if (!ERAS.includes(eraRaw as ProductEra)) {
    return { ok: false, error: "Era invalida" };
  }

  let customizationSurcharge: number | null = null;
  if (supportsCustomization) {
    if (surchargeRaw === "") {
      return { ok: false, error: "El recargo de personalizacion es requerido" };
    }
    const n = Number(surchargeRaw);
    if (Number.isNaN(n) || n < 0) {
      return { ok: false, error: "El recargo debe ser un numero >= 0" };
    }
    customizationSurcharge = n;
  }

  return {
    ok: true,
    value: {
      title,
      slug,
      audience: audienceRaw as "adult" | "kids",
      productType: productTypeRaw as ProductType,
      entitySlug,
      entityName,
      entityKind: entityKindRaw as CatalogEntityKind,
      era: eraRaw as ProductEra,
      supportsCustomization,
      customizationSurcharge,
    },
  };
}

/** Alta de producto: exige precio inicial de variantes S-XXL solo para audiencia adulta (no se persiste en el producto). */
export type ValidatedCreateProductInput = ValidatedProductInput & {
  initialAdultVariantPrice: number | null;
};

export function parseAndValidateCreateProductFormData(
  formData: FormData
):
  | { ok: true; value: ValidatedCreateProductInput }
  | { ok: false; error: string } {
  const base = parseAndValidateProductFormData(formData);
  if (!base.ok) {
    return base;
  }
  if (base.value.audience === "kids") {
    return {
      ok: true,
      value: { ...base.value, initialAdultVariantPrice: null },
    };
  }
  const raw = String(formData.get("initialAdultVariantPrice") ?? "").trim();
  const price = parseNonNegativeNumber(
    raw,
    "Precio inicial (talles S a XXL)"
  );
  if (typeof price === "object" && "error" in price) {
    return { ok: false, error: price.error };
  }
  return {
    ok: true,
    value: { ...base.value, initialAdultVariantPrice: price },
  };
}

export type ValidatedVariantInput = {
  size: string;
  unitBasePrice: number;
  expressStock: number;
  allowMadeToOrder: boolean;
  madeToOrderMinDays: number | null;
  madeToOrderMaxDays: number | null;
};

export function parseAndValidateVariantFormData(
  formData: FormData
): { ok: true; value: ValidatedVariantInput } | { ok: false; error: string } {
  const size = String(formData.get("size") ?? "").trim();
  const unitBasePriceRaw = String(formData.get("unitBasePrice") ?? "");
  const expressStockRaw = String(formData.get("expressStock") ?? "");
  const allowMadeToOrder = String(formData.get("allowMadeToOrder") ?? "") === "true";
  const minRaw = String(formData.get("madeToOrderMinDays") ?? "");
  const maxRaw = String(formData.get("madeToOrderMaxDays") ?? "");

  if (size === "") {
    return { ok: false, error: "El talle es requerido" };
  }

  const unitPrice = parseNonNegativeNumber(unitBasePriceRaw, "Precio base");
  if (typeof unitPrice === "object" && "error" in unitPrice) {
    return { ok: false, error: unitPrice.error };
  }

  const expressStock = parseNonNegativeInt(expressStockRaw, "Stock express");
  if (typeof expressStock === "object" && "error" in expressStock) {
    return { ok: false, error: expressStock.error };
  }

  let madeToOrderMinDays: number | null = null;
  let madeToOrderMaxDays: number | null = null;

  if (allowMadeToOrder) {
    const min = parseIntStrict(minRaw, "Dias min encargo");
    if (typeof min === "object" && "error" in min) {
      return { ok: false, error: min.error };
    }
    const max = parseIntStrict(maxRaw, "Dias max encargo");
    if (typeof max === "object" && "error" in max) {
      return { ok: false, error: max.error };
    }
    if (min < 1 || max < 1) {
      return { ok: false, error: "Los dias de encargo deben ser >= 1" };
    }
    if (min > max) {
      return { ok: false, error: "El minimo de dias no puede ser mayor al maximo" };
    }
    madeToOrderMinDays = min;
    madeToOrderMaxDays = max;
  }

  const forDomainCheck: ProductVariant = {
    id: "",
    productId: "",
    size,
    expressStock,
    allowMadeToOrder,
    madeToOrderMinDays,
    madeToOrderMaxDays,
  };

  if (!isValidMadeToOrderRange(forDomainCheck)) {
    return { ok: false, error: "Rango de encargo invalido" };
  }

  return {
    ok: true,
    value: {
      size,
      unitBasePrice: unitPrice,
      expressStock,
      allowMadeToOrder,
      madeToOrderMinDays,
      madeToOrderMaxDays,
    },
  };
}
