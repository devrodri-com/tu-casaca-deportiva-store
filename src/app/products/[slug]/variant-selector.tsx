"use client";

import { useMemo, useState } from "react";
import type { CatalogProductDetailVariant } from "@/modules/catalog/application/get-catalog-product-detail";

type VariantSelectorProps = {
  variants: CatalogProductDetailVariant[];
  initialVariantId: string | null;
};

export function VariantSelector({
  variants,
  initialVariantId,
}: VariantSelectorProps) {
  const fallbackVariantId = variants[0]?.id ?? null;
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
  const effectiveSelectedVariantId = useMemo(() => {
    if (
      selectedVariantId &&
      variants.some((variant) => variant.id === selectedVariantId)
    ) {
      return selectedVariantId;
    }
    return initialVariantId ?? fallbackVariantId;
  }, [fallbackVariantId, initialVariantId, selectedVariantId, variants]);

  const selectedVariant = useMemo(
    () =>
      variants.find((variant) => variant.id === effectiveSelectedVariantId) ?? null,
    [effectiveSelectedVariantId, variants]
  );

  if (variants.length === 0 || !selectedVariant) {
    return <p className="text-sm text-foreground/80">Sin variantes.</p>;
  }

  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-lg font-medium">Variantes</h2>
      <ul className="flex flex-wrap gap-2">
        {variants.map((variant) => (
          <li key={variant.id}>
            <button
              type="button"
              onClick={() => setSelectedVariantId(variant.id)}
              className="rounded border px-3 py-1 text-sm"
            >
              {variant.size}
            </button>
          </li>
        ))}
      </ul>

      <div className="rounded border p-3 text-sm">
        <p>size: {selectedVariant.size}</p>
        <p>availability: {selectedVariant.availability}</p>
        <p>fulfillment: {selectedVariant.fulfillment}</p>
        <p>
          promisedDays: {String(selectedVariant.promisedDays.minDays)} /{" "}
          {String(selectedVariant.promisedDays.maxDays)}
        </p>
        <p>finalUnitPrice: {selectedVariant.finalUnitPrice}</p>
      </div>
    </section>
  );
}
