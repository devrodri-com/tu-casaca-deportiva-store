"use client";

import { useMemo, useState } from "react";
import type { CatalogProductDetailVariant } from "@/modules/catalog/application/get-catalog-product-detail";

type VariantSelectorProps = {
  variants: CatalogProductDetailVariant[];
  initialVariantId: string | null;
  supportsCustomization: boolean;
  customizationSurcharge: number | null;
};

export function VariantSelector({
  variants,
  initialVariantId,
  supportsCustomization,
  customizationSurcharge,
}: VariantSelectorProps) {
  const fallbackVariantId = variants[0]?.id ?? null;
  const customizationScope = useMemo(
    () =>
      `${supportsCustomization}:${String(customizationSurcharge)}:${initialVariantId ?? ""}:${variants
        .map((variant) => variant.id)
        .join(",")}`,
    [customizationSurcharge, initialVariantId, supportsCustomization, variants]
  );
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
  const [customizationState, setCustomizationState] = useState<{
    scope: string;
    enabled: boolean;
  }>({ scope: customizationScope, enabled: false });
  const showCustomization =
    customizationState.scope === customizationScope && customizationState.enabled;
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
  const selectedResolution = useMemo(() => {
    if (!selectedVariant) {
      return null;
    }
    if (showCustomization && selectedVariant.customizedResolution) {
      return selectedVariant.customizedResolution;
    }
    return selectedVariant.baseResolution;
  }, [selectedVariant, showCustomization]);

  if (variants.length === 0 || !selectedVariant || !selectedResolution) {
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
      {supportsCustomization ? (
        <div className="flex flex-col gap-2 text-sm">
          <p>
            Personalización disponible (surcharge:{" "}
            {String(customizationSurcharge)})
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() =>
                setCustomizationState({
                  scope: customizationScope,
                  enabled: false,
                })
              }
              className="rounded border px-3 py-1"
            >
              Sin personalización
            </button>
            <button
              type="button"
              onClick={() =>
                setCustomizationState({
                  scope: customizationScope,
                  enabled: true,
                })
              }
              className="rounded border px-3 py-1"
            >
              Con personalización
            </button>
          </div>
        </div>
      ) : null}

      <div className="rounded border p-3 text-sm">
        <p>size: {selectedVariant.size}</p>
        <p>availability: {selectedVariant.availability}</p>
        <p>fulfillment: {selectedResolution.fulfillment}</p>
        <p>
          promisedDays: {String(selectedResolution.promisedDays.minDays)} /{" "}
          {String(selectedResolution.promisedDays.maxDays)}
        </p>
        <p>finalUnitPrice: {selectedResolution.finalUnitPrice}</p>
      </div>
    </section>
  );
}
