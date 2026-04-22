"use client";

import { useMemo, useState } from "react";
import type {
  CatalogProductDetailResolution,
  CatalogProductDetailVariant,
} from "@/modules/catalog/application/get-catalog-product-detail";
import { addCartLine, createCartLineFromSelection } from "@/modules/cart";

type VariantSelectorProps = {
  productId: string;
  title: string;
  variants: CatalogProductDetailVariant[];
  initialVariantId: string | null;
  supportsCustomization: boolean;
  customizationSurcharge: number | null;
};

function getMainDeliveryMessage(
  resolution: CatalogProductDetailResolution,
  params: { isUnavailable: boolean; isCustomized: boolean }
): string {
  if (params.isUnavailable) {
    return "Sin disponibilidad";
  }
  if (params.isCustomized) {
    const min = resolution.promisedDays.minDays;
    const max = resolution.promisedDays.maxDays;
    if (min !== null && max !== null) {
      return `Con personalizacion: ${min}-${max} dias`;
    }
    return "Con personalizacion";
  }
  if (resolution.fulfillment === "express") {
    return "Llega en 24-48h";
  }
  if (resolution.fulfillment === "made_to_order") {
    const min = resolution.promisedDays.minDays;
    const max = resolution.promisedDays.maxDays;
    if (min !== null && max !== null) {
      return `Llega en ${min}-${max} dias`;
    }
    return "Llega en 14-21 dias";
  }
  return "Sin disponibilidad";
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

  if (variants.length === 0 || !selectedVariant || !selectedResolution) {
    return <p className="text-sm text-foreground/80">Sin variantes.</p>;
  }

  const mainDeliveryMessage = getMainDeliveryMessage(selectedResolution, {
    isUnavailable: selectedVariant.availability === "unavailable",
    isCustomized: isCustomizedSelection,
  });

  return (
    <section className="flex flex-col gap-5 rounded border p-4 md:p-5">
      <div className="flex flex-col gap-2">
        <p className="text-3xl font-semibold tabular-nums">
          ${selectedResolution.finalUnitPrice}
        </p>
        <p className="text-base font-medium leading-snug text-foreground">
          {mainDeliveryMessage}
        </p>
        {selectedVariant.isLowStock ? (
          <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
            Quedan pocas unidades en este talle
          </p>
        ) : null}
      </div>

      <div className="flex flex-col gap-2">
        <h2 className="text-sm font-semibold">Talle seleccionado: {selectedVariant.sizeLabel}</h2>
        {selectedVariant.availability === "unavailable" ? (
          <p className="text-sm text-foreground/80">Este talle no esta disponible ahora.</p>
        ) : null}
        <ul className="flex flex-wrap gap-2" aria-label="Talles">
          {variants.map((variant) => {
            const isCurrent = variant.id === selectedVariant.id;
            return (
              <li key={variant.id}>
                <button
                  type="button"
                  onClick={() => setSelectedVariantId(variant.id)}
                  className={`rounded border px-3 py-1.5 text-sm transition-colors ${
                    isCurrent
                      ? "bg-foreground font-semibold text-background ring-2 ring-foreground ring-offset-2 ring-offset-background"
                      : "hover:bg-foreground/5"
                  }`}
                >
                  {variant.sizeLabel}
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {supportsCustomization && customizationSurcharge !== null ? (
        <div className="flex flex-col gap-2 rounded border p-3 text-sm">
          <p className="font-medium">
            {showCustomization
              ? `Precio con personalizacion: $${selectedResolution.finalUnitPrice}`
              : "Personalizacion opcional"}
          </p>
          <p className="text-foreground/80">Suma nombre y numero por + ${customizationSurcharge}</p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() =>
                setCustomizationState({
                  scope: customizationScope,
                  enabled: false,
                })
              }
              className="rounded border px-3 py-1.5"
            >
              Sin personalizacion
            </button>
            <button
              type="button"
              onClick={() =>
                setCustomizationState({
                  scope: customizationScope,
                  enabled: true,
                })
              }
              className="rounded border px-3 py-1.5"
            >
              Con personalizacion
            </button>
          </div>
        </div>
      ) : (
        <p className="text-sm text-foreground/80">Este producto no admite personalizacion.</p>
      )}

      <div className="flex flex-col gap-2">
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
          className="w-full rounded border bg-foreground py-2.5 text-sm font-semibold text-background disabled:cursor-not-allowed disabled:opacity-50"
          disabled={!canAddToCart}
        >
          Agregar al carrito
        </button>
        <div className="flex flex-col gap-1 text-center text-xs text-foreground/80">
          <p>Podes revisar todo antes de pagar</p>
          <p>No se cobra hasta confirmar en Mercado Pago</p>
          <p>Sin sorpresas: ves lo que compras</p>
        </div>
      </div>

      <div className="flex flex-col gap-1 border-t border-foreground/10 pt-3 text-xs text-foreground/80">
        <p className="font-medium text-foreground">Producto popular</p>
        <p>Pago seguro con Mercado Pago</p>
        <p>Confirmamos tu pedido al pagar</p>
        <p>Producto tal cual se muestra</p>
        <p>Compra simple y segura</p>
      </div>
    </section>
  );
}
