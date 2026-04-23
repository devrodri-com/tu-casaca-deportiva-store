import type { ProductType } from "@/modules/catalog";

export type AdminProductListStatus = "all" | "active" | "inactive";

export type AdminProductListCustomization = "all" | "yes" | "no";

export type AdminProductListQuery = {
  search: string;
  status: AdminProductListStatus;
  productType: "all" | ProductType;
  audience: "all" | "adult" | "kids";
  customization: AdminProductListCustomization;
};

function firstParam(
  raw: Record<string, string | string[] | undefined>,
  key: string
): string | undefined {
  const v = raw[key];
  if (v === undefined) {
    return undefined;
  }
  return Array.isArray(v) ? v[0] : v;
}

function parseStatus(value: string | undefined): AdminProductListStatus {
  if (value === "active" || value === "inactive") {
    return value;
  }
  return "all";
}

function parseProductType(value: string | undefined): "all" | ProductType {
  if (
    value === "football_jersey" ||
    value === "nba_jersey" ||
    value === "jacket"
  ) {
    return value;
  }
  return "all";
}

function parseAudience(value: string | undefined): "all" | "adult" | "kids" {
  if (value === "adult" || value === "kids") {
    return value;
  }
  return "all";
}

function parseCustomization(value: string | undefined): AdminProductListCustomization {
  if (value === "yes" || value === "no") {
    return value;
  }
  return "all";
}

export function parseAdminProductListQuery(
  raw: Record<string, string | string[] | undefined>
): AdminProductListQuery {
  return {
    search: (firstParam(raw, "q") ?? "").trim(),
    status: parseStatus(firstParam(raw, "status")),
    productType: parseProductType(firstParam(raw, "type")),
    audience: parseAudience(firstParam(raw, "audience")),
    customization: parseCustomization(firstParam(raw, "custom")),
  };
}
