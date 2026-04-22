import type { CatalogVariantRecord } from "./catalog-mappers";

/** Orden fijo de preset adulto; otros talles van despues alfabeticamente */
export const ADULT_PRESET_SIZES = ["S", "M", "L", "XL", "XXL"] as const;

function sizeOrderKey(size: string): number {
  const preset = ADULT_PRESET_SIZES as readonly string[];
  const idx = preset.indexOf(size);
  if (idx !== -1) {
    return idx;
  }
  return 100 + size.charCodeAt(0);
}

/**
 * S, M, L, XL, XXL primero; resto por orden lexicografico estable.
 */
export function sortVariantRecordsBySize(
  records: CatalogVariantRecord[]
): CatalogVariantRecord[] {
  return [...records].sort((a, b) => {
    const ka = sizeOrderKey(a.variant.size);
    const kb = sizeOrderKey(b.variant.size);
    if (ka !== kb) {
      return ka - kb;
    }
    return a.variant.size.localeCompare(b.variant.size, "es");
  });
}
