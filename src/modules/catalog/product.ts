export type ProductType = "football_jersey" | "nba_jersey" | "jacket";

export type ProductEra = "current" | "retro";

export type CatalogEntityKind = "club" | "national_team" | "franchise";

export type CatalogEntity = {
  slug: string;
  name: string;
  kind: CatalogEntityKind;
};

export type Product = {
  id: string;
  slug: string;
  title: string;
  audience: "adult" | "kids";
  productType: ProductType;
  entity: CatalogEntity;
  era: ProductEra;
  supportsCustomization: boolean;
  customizationSurcharge: number | null;
  /** Publicacion en storefront; no es disponibilidad por variante */
  isActive: boolean;
};
