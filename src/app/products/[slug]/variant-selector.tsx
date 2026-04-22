"use client";

import { useMemo, useState } from "react";
import type { CatalogProductDetailVariant } from "@/modules/catalog/application/get-catalog-product-detail";
import { addCartLine, createCartLineFromSelection } from "@/modules/cart";

type VariantSelectorProps = {
  productId: string;
  title: string;
  variants: CatalogProductDetailVariant[];
  initialVariantId: string | null;
  supportsCustomization: boolean;
  customizationSurcharge: number | null;
};

function getDeliveryMessage(params: {
  minDays: number | null;
  maxDays: number | null;
  isUnavailable: boolean;
  isCustomized: boolean;
}): string {
  if (params.isUnavailable) {
    return "Sin disponibilidad";
  }
  if (params.minDays === 0 && params.maxDays === 2) {
    return "Entrega en 24-48h";
  }
  if (params.isCustomized) {
    return `Con personalizacion: entrega en ${params.minDays ?? "?"}-${params.maxDays ?? "?"} dias`;
  }
  return `Entrega en ${params.minDays ?? "?"}-${params.maxDays ?? "?"} dias`;
}

export function VariantSelector({
  productId,
  title,
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
  const isCustomizedSelection =
    showCustomization && selectedVariant?.customizedResolution !== null;
  const canAddToCart =
    selectedVariant?.availability !== "unavailable" && selectedVariant !== null;
  const selectedDeliveryMessage = getDeliveryMessage({
    minDays: selectedResolution?.promisedDays.minDays ?? null,
    maxDays: selectedResolution?.promisedDays.maxDays ?? null,
    isUnavailable: selectedVariant?.availability === "unavailable",
    isCustomized: isCustomizedSelection,
  });

  if (variants.length === 0 || !selectedVariant || !selectedResolution) {
    return <p className="text-sm text-foreground/80">Sin variantes.</p>;
  }

  return (
    <section className="flex flex-col gap-4 rounded border p-4">
      <div className="flex flex-col gap-1">
        <p className="text-2xl font-semibold">${selectedResolution.finalUnitPrice}</p>
        <p className="rounded border bg-foreground/[0.03] px-3 py-2 text-sm font-medium">
          {selectedDeliveryMessage}
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <h2 className="text-sm font-medium">Talle seleccionado: {selectedVariant.sizeLabel}</h2>
        {selectedVariant.availability === "unavailable" ? (
          <p className="text-sm text-foreground/80">
            Este talle no esta disponible ahora.
          </p>
        ) : null}
      </div>

      <ul className="flex flex-wrap gap-2">
        {variants.map((variant) => (
          <li key={variant.id}>
            <button
              type="button"
              onClick={() => setSelectedVariantId(variant.id)}
              className={`rounded border px-3 py-1 text-sm ${
                variant.id === selectedVariant.id ? "bg-foreground text-background" : ""
              }`}
            >
              {variant.sizeLabel}
            </button>
          </li>
        ))}
      </ul>

      {supportsCustomization && customizationSurcharge !== null ? (
        <div className="flex flex-col gap-2 rounded border p-3 text-sm">
          <p className="font-medium">
            {showCustomization
              ? `Precio con personalizacion: $${selectedResolution.finalUnitPrice}`
              : "Personalizacion opcional"}
          </p>
          <p className="text-foreground/80">
            Suma nombre y numero por + ${customizationSurcharge}
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
      ) : (
        <p className="text-sm text-foreground/80">
          Este producto no admite personalizacion.
        </p>
      )}

      <button
        type="button"
        onClick={() => {
          if (!canAddToCart) {
            return;
          }
          const line = createCartLineFromSelection({
            productId,
            variantId: selectedVariant.id,
            title,
            size: selectedVariant.sizeLabel,
            resolution: selectedResolution,
            quantity: 1,
            customizationEnabled: isCustomizedSelection,
            customizationSurcharge,
          });
          addCartLine(line);
        }}
        className="w-full rounded border px-3 py-2 text-sm font-medium disabled:opacity-50"
        disabled={!canAddToCart}
      >
        {canAddToCart ? "Agregar al carrito" : "Opcion sin disponibilidad"}
      </button>

      <div className="flex flex-col gap-1 text-xs text-foreground/80">
        <p>Podes revisar tu pedido antes de pagar.</p>
        <p>Pago seguro con Mercado Pago.</p>
        <p>Tu pedido se confirma al pagar.</p>
        <p>Recibis exactamente lo que ves.</p>
      </div>
    </section>
  );
}
