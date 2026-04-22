import { resolveAvailability } from "@/modules/catalog";
import { getCatalogProductBySlug } from "@/modules/catalog/infrastructure/catalog-store";

export type CatalogProductDetailVariant = {
  id: string;
  size: string;
  availability: "express" | "made_to_order" | "unavailable";
};

export type CatalogProductDetail = {
  slug: string;
  title: string;
  entity: {
    slug: string;
    name: string;
    kind: "club" | "national_team" | "franchise";
  };
  era: "current" | "retro";
  variants: CatalogProductDetailVariant[];
};

export async function getCatalogProductDetail(
  slug: string
): Promise<CatalogProductDetail | null> {
  const record = await getCatalogProductBySlug(slug);
  if (!record) {
    return null;
  }

  return {
    slug: record.product.slug,
    title: record.product.title,
    entity: record.product.entity,
    era: record.product.era,
    variants: record.variants.map(({ variant }) => ({
      id: variant.id,
      size: variant.size,
      availability: resolveAvailability(variant),
    })),
  };
}
