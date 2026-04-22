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

function pdpTalleModeLabel(availability: CatalogProductDetailVariant["availability"]): string {
  if (availability === "express") {
    return "Express";
  }
  if (availability === "made_to_order") {
    return "Por encargo";
  }
  return "No disponible";
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
    return <p className="tcds-prose">Sin variantes.</p>;
  }

  const mainDeliveryMessage = getMainDeliveryMessage(selectedResolution, {
    isUnavailable: selectedVariant.availability === "unavailable",
    isCustomized: isCustomizedSelection,
  });

  return (
    <section className="tcds-card flex flex-col gap-5 p-4 md:p-5">
      <div className="flex flex-col gap-2">
        <p className="text-3xl font-semibold tabular-nums text-foreground">
          ${selectedResolution.finalUnitPrice}
        </p>
        <p className="text-base font-medium leading-snug text-foreground">
          {mainDeliveryMessage}
        </p>
        {selectedVariant.isLowStock ? (
          <p className="text-sm font-medium text-amber-800">
            Quedan pocas unidades en este talle
          </p>
        ) : null}
      </div>

      <div className="flex flex-col gap-2">
        <h2 className="text-sm font-semibold text-foreground">
          Talle seleccionado: {selectedVariant.sizeLabel}
        </h2>
        {selectedVariant.availability === "unavailable" ? (
          <p className="tcds-prose">Este talle no esta disponible ahora.</p>
        ) : null}
        <ul className="flex flex-wrap gap-2" aria-label="Talles">
          {variants.map((variant) => {
            const isCurrent = variant.id === selectedVariant.id;
            const isUnavailable = variant.availability === "unavailable";
            const mode = pdpTalleModeLabel(variant.availability);
            const common =
              "inline-flex min-h-[3.25rem] min-w-[3.5rem] flex-col items-center justify-center rounded-md border px-2 py-1.5 text-sm transition-colors";
            let buttonClass = common;
            if (isUnavailable) {
              buttonClass +=
                " border-dashed border-border bg-surface/60 text-foreground/50";
              if (isCurrent) {
                buttonClass +=
                  " ring-1 ring-foreground/20 bg-foreground/5 font-medium text-foreground/80";
              }
            } else if (isCurrent) {
              buttonClass +=
                " border-sky-300 bg-sky-50 font-semibold text-sky-900 ring-2 ring-sky-500 ring-offset-2 ring-offset-white";
            } else {
              buttonClass += " border border-gray-300 bg-white hover:bg-surface";
            }
            return (
              <li key={variant.id}>
                <button
                  type="button"
                  onClick={() => setSelectedVariantId(variant.id)}
                  className={buttonClass}
                >
                  <span className="leading-tight">{variant.sizeLabel}</span>
                  <span
                    className={`mt-0.5 text-[10px] leading-tight ${
                      isUnavailable ? "text-foreground/45" : "text-muted-foreground"
                    }`}
                  >
                    {mode}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {supportsCustomization && customizationSurcharge !== null ? (
        <div className="tcds-card flex flex-col gap-2 p-3 text-sm">
          <p className="font-medium text-foreground">
            {showCustomization
              ? `Precio con personalizacion: $${selectedResolution.finalUnitPrice}`
              : "Personalizacion opcional"}
          </p>
          <p className="tcds-prose">Suma nombre y numero por + ${customizationSurcharge}</p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() =>
                setCustomizationState({
                  scope: customizationScope,
                  enabled: false,
                })
              }
              className="tcds-btn-secondary"
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
              className="tcds-btn-secondary"
            >
              Con personalizacion
            </button>
          </div>
        </div>
      ) : (
        <p className="tcds-prose">Este producto no admite personalizacion.</p>
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
          className="tcds-btn-primary w-full"
          disabled={!canAddToCart}
        >
          Agregar al carrito
        </button>
        <div className="flex flex-col gap-1 text-center text-xs text-muted-foreground">
          <p>Podes revisar todo antes de pagar</p>
          <p>No se cobra hasta confirmar en Mercado Pago</p>
          <p>Sin sorpresas: ves lo que compras</p>
        </div>
      </div>

      <div className="flex flex-col gap-1 border-t border-border pt-3 text-xs text-muted-foreground">
        <p className="font-medium text-foreground">Producto popular</p>
        <p>Pago seguro con Mercado Pago</p>
        <p>Confirmamos tu pedido al pagar</p>
        <p>Producto tal cual se muestra</p>
        <p>Compra simple y segura</p>
      </div>
    </section>
  );
}
