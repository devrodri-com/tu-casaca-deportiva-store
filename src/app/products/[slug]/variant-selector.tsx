"use client";

import { useMemo, useState } from "react";
import type {
  CatalogProductDetailResolution,
  CatalogProductDetailVariant,
} from "@/modules/catalog/application/get-catalog-product-detail";
import { addCartLine, createCartLineFromSelection } from "@/modules/cart";

type VariantSelectorProps = {
  productId: string;
  productSlug: string;
  title: string;
  imageUrl: string | null;
  imageAlt: string | null;
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
      return `Con personalización: entrega en ${min}-${max} días`;
    }
    return "Con personalización";
  }
  if (resolution.fulfillment === "express") {
    return "Retiro hoy o envío en 24-48 h";
  }
  if (resolution.fulfillment === "made_to_order") {
    const min = resolution.promisedDays.minDays;
    const max = resolution.promisedDays.maxDays;
    if (min !== null && max !== null) {
      return `Entrega estimada en ${min}-${max} días`;
    }
    return "Entrega estimada en 14-21 días";
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
  productSlug,
  title,
  imageUrl,
  imageAlt,
  variants,
  initialVariantId,
  supportsCustomization,
  customizationSurcharge,
}: VariantSelectorProps) {
  const [quantity, setQuantity] = useState(1);
  const [addFeedback, setAddFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
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
  const [customizationNumber, setCustomizationNumber] = useState("");
  const [customizationName, setCustomizationName] = useState("");
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

  if (variants.length === 0 || !selectedVariant || !selectedResolution) {
    return <p className="tcds-prose">Sin variantes.</p>;
  }
  const trimmedCustomizationName = customizationName.trim();
  const isCustomizationComplete =
    /^\d+$/.test(customizationNumber) && trimmedCustomizationName.length > 0;
  const isExpressSelection =
    !isCustomizedSelection &&
    selectedVariant.baseResolution.fulfillment === "express";
  const exceedsExpressStock = isExpressSelection && quantity > selectedVariant.expressStock;
  const canSplitWithMadeToOrder =
    exceedsExpressStock && selectedVariant.madeToOrderResolution !== null;
  const isMixedSplit = canSplitWithMadeToOrder;
  const canAddToCart =
    selectedResolution.fulfillment !== "unavailable" &&
    (!exceedsExpressStock || canSplitWithMadeToOrder);
  const canSubmit = canAddToCart && (!isCustomizedSelection || isCustomizationComplete);

  const mainDeliveryMessage = getMainDeliveryMessage(selectedResolution, {
    isUnavailable: selectedVariant.availability === "unavailable",
    isCustomized: isCustomizedSelection,
  });
  const fulfillmentChipText =
    selectedResolution.fulfillment === "express"
      ? "Express"
      : selectedResolution.fulfillment === "made_to_order"
        ? "Por encargo"
        : "Sin disponibilidad";
  const fulfillmentChipClassName =
    selectedResolution.fulfillment === "express"
      ? "border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-800/45 dark:bg-emerald-950/45 dark:text-emerald-300"
      : selectedResolution.fulfillment === "made_to_order"
        ? "border-sky-300 bg-sky-50 text-sky-900 dark:border-sky-800/40 dark:bg-sky-950/40 dark:text-sky-200"
        : "border-zinc-300 bg-zinc-100 text-zinc-700 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-400";
  const trustItems = [
    "Cuotas con Mercado Pago",
    "Envío 24–48 h",
    "Retiro hoy",
    "WhatsApp 1–3 min",
    "Entregas en Montevideo $169 · Envíos al interior por DAC",
  ] as const;

  return (
    <section className="flex flex-col gap-5 rounded-2xl border border-zinc-200 bg-white p-4 shadow-lg shadow-zinc-200/40 ring-1 ring-zinc-100 md:p-5 dark:border-white/10 dark:bg-neutral-900/90 dark:shadow-black/30 dark:ring-white/5">
      <div className="flex flex-col gap-2">
        <div className="flex items-start justify-between gap-3">
          <p className="text-3xl font-semibold tabular-nums text-zinc-900 dark:text-white">
            ${selectedResolution.finalUnitPrice}
          </p>
          <span
            className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-medium ${fulfillmentChipClassName}`}
          >
            {fulfillmentChipText}
          </span>
        </div>
        <p className="text-sm leading-relaxed text-zinc-600 dark:text-neutral-300">{mainDeliveryMessage}</p>
        {isCustomizedSelection ? (
          <p className="text-xs text-sky-700 dark:text-sky-300">
            Con personalización este pedido se procesa por encargo.
          </p>
        ) : null}
        {isMixedSplit ? (
          <p className="rounded-md border border-sky-200 bg-sky-50 px-2.5 py-2 text-xs text-sky-900 dark:border-sky-500/20 dark:bg-sky-950/20 dark:text-sky-300">
            Se agregarán {selectedVariant.expressStock} unidades con entrega express y{" "}
            {quantity - selectedVariant.expressStock} unidad
            {quantity - selectedVariant.expressStock === 1 ? "" : "es"} por encargo.
          </p>
        ) : null}
        {exceedsExpressStock && !canSplitWithMadeToOrder ? (
          <p className="rounded-md border border-red-200 bg-red-50 px-2.5 py-2 text-xs text-red-800 dark:border-red-500/25 dark:bg-red-950/20 dark:text-red-300">
            No hay stock express suficiente y este talle no admite encargo para cubrir esa cantidad.
          </p>
        ) : null}
        {selectedVariant.isLowStock ? (
          <p className="text-xs font-medium text-sky-700 dark:text-sky-300">
            Quedan pocas unidades en este talle.
          </p>
        ) : null}
      </div>

      <div className="flex flex-col gap-2">
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-white">
          Elegí talle ({selectedVariant.sizeLabel})
        </h2>
        {selectedVariant.availability === "unavailable" ? (
          <p className="text-xs text-zinc-500 dark:text-neutral-400">Este talle no está disponible en este momento.</p>
        ) : null}
        <ul className="flex flex-wrap gap-2" aria-label="Talles">
          {variants.map((variant) => {
            const isCurrent = variant.id === selectedVariant.id;
            const isUnavailable = variant.availability === "unavailable";
            const mode = pdpTalleModeLabel(variant.availability);
            const common =
              "inline-flex min-h-[3.25rem] min-w-[3.5rem] flex-col items-center justify-center rounded-md border px-2 py-1.5 text-sm transition";
            let buttonClass = common;
            if (isUnavailable) {
              buttonClass +=
                " border-dashed border-zinc-300 bg-zinc-100 text-zinc-400 dark:border-white/15 dark:bg-neutral-900/70 dark:text-neutral-500";
              if (isCurrent) {
                buttonClass +=
                  " ring-1 ring-zinc-400 text-zinc-600 dark:ring-white/20 dark:text-neutral-300";
              }
            } else if (isCurrent) {
              buttonClass +=
                " border-sky-500/50 bg-sky-50 font-semibold text-sky-900 ring-2 ring-sky-500/60 dark:border-sky-400/60 dark:bg-sky-500/15 dark:text-sky-100 dark:ring-sky-500/70";
            } else {
              buttonClass +=
                " border-zinc-300 bg-white text-zinc-800 hover:border-sky-400 hover:text-sky-800 dark:border-white/15 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:border-sky-500/40 dark:hover:text-sky-100";
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
                      isUnavailable ? "text-zinc-400 dark:text-neutral-500" : "text-zinc-500 dark:text-neutral-400"
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
        <div className="flex flex-col gap-2 rounded-xl border border-zinc-200 bg-zinc-50 p-3 text-sm dark:border-white/10 dark:bg-neutral-950/70">
          <p className="font-medium text-zinc-900 dark:text-white">
            {showCustomization
              ? `Precio con personalización: $${selectedResolution.finalUnitPrice}`
              : "Personalización opcional"}
          </p>
          <p className="text-xs leading-relaxed text-zinc-600 dark:text-neutral-400">
            Sumá nombre y número por + ${customizationSurcharge}. Al personalizar, el pedido pasa a
            modalidad por encargo.
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() =>
                setCustomizationState({
                  scope: customizationScope,
                  enabled: false,
                })
              }
              className={`inline-flex min-h-9 items-center justify-center rounded-md border px-3 text-xs font-medium transition ${
                !showCustomization
                  ? "border-sky-500/40 bg-sky-500/10 text-sky-900 dark:border-sky-400/45 dark:bg-sky-500/15 dark:text-sky-100"
                  : "border-zinc-300 text-zinc-700 hover:border-sky-400 dark:border-white/15 dark:text-neutral-300 dark:hover:border-sky-500/40"
              }`}
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
              className={`inline-flex min-h-9 items-center justify-center rounded-md border px-3 text-xs font-medium transition ${
                showCustomization
                  ? "border-sky-500/40 bg-sky-500/10 text-sky-900 dark:border-sky-400/45 dark:bg-sky-500/15 dark:text-sky-100"
                  : "border-zinc-300 text-zinc-700 hover:border-sky-400 dark:border-white/15 dark:text-neutral-300 dark:hover:border-sky-500/40"
              }`}
            >
              Con personalización
            </button>
          </div>
          {showCustomization ? (
            <div className="mt-1 grid gap-2 sm:grid-cols-2">
              <label className="flex flex-col gap-1 text-xs text-zinc-700 dark:text-neutral-300">
                Número
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={2}
                  value={customizationNumber}
                  onChange={(event) =>
                    setCustomizationNumber(event.target.value.replace(/\D/g, ""))
                  }
                  placeholder="7"
                  className="min-h-9 rounded-md border border-zinc-300 bg-white px-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-sky-500/60 focus:outline-none dark:border-white/15 dark:bg-neutral-900 dark:text-white dark:placeholder:text-neutral-500"
                />
              </label>
              <label className="flex flex-col gap-1 text-xs text-zinc-700 dark:text-neutral-300">
                Nombre
                <input
                  type="text"
                  maxLength={18}
                  value={customizationName}
                  onChange={(event) => setCustomizationName(event.target.value)}
                  placeholder="Ronaldo"
                  className="min-h-9 rounded-md border border-zinc-300 bg-white px-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-sky-500/60 focus:outline-none dark:border-white/15 dark:bg-neutral-900 dark:text-white dark:placeholder:text-neutral-500"
                />
              </label>
            </div>
          ) : null}
          {showCustomization && !isCustomizationComplete ? (
            <p className="rounded-md border border-sky-200 bg-sky-50 px-2.5 py-2 text-xs text-sky-900 dark:border-sky-500/20 dark:bg-sky-950/20 dark:text-sky-300">
              Completá número y nombre para agregar al carrito con personalización.
            </p>
          ) : null}
        </div>
      ) : (
        <p className="text-xs text-zinc-500 dark:text-neutral-500">Este producto no admite personalización.</p>
      )}

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2.5 dark:border-white/10 dark:bg-neutral-950/60">
          <span className="text-xs font-medium text-zinc-700 dark:text-neutral-300">Cantidad</span>
          <div className="inline-flex items-center rounded-md border border-zinc-300 bg-white dark:border-white/15 dark:bg-neutral-900">
            <button
              type="button"
              onClick={() => {
                setQuantity((prev) => Math.max(1, prev - 1));
                setAddFeedback(null);
              }}
              className="inline-flex h-8 w-8 items-center justify-center text-sm text-zinc-600 transition hover:text-zinc-900 dark:text-neutral-300 dark:hover:text-white"
              aria-label="Restar cantidad"
            >
              -
            </button>
            <span className="inline-flex h-8 min-w-9 items-center justify-center border-x border-zinc-200 px-2 text-sm font-semibold text-zinc-900 dark:border-white/10 dark:text-white">
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => {
                setQuantity((prev) => Math.min(20, prev + 1));
                setAddFeedback(null);
              }}
              className="inline-flex h-8 w-8 items-center justify-center text-sm text-zinc-600 transition hover:text-zinc-900 dark:text-neutral-300 dark:hover:text-white"
              aria-label="Sumar cantidad"
            >
              +
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            if (!canSubmit) {
              return;
            }
            try {
              if (isMixedSplit && selectedVariant.madeToOrderResolution) {
                const expressQty = selectedVariant.expressStock;
                const madeToOrderQty = quantity - selectedVariant.expressStock;
                const expressLine = createCartLineFromSelection({
                  productId,
                  productSlug,
                  variantId: selectedVariant.id,
                  title,
                  imageUrl,
                  imageAlt,
                  size: selectedVariant.sizeLabel,
                  resolution: selectedVariant.baseResolution,
                  quantity: expressQty,
                  customizationEnabled: false,
                  customizationSurcharge,
                  customizationNumber: null,
                  customizationName: null,
                });
                const madeToOrderLine = createCartLineFromSelection({
                  productId,
                  productSlug,
                  variantId: selectedVariant.id,
                  title,
                  imageUrl,
                  imageAlt,
                  size: selectedVariant.sizeLabel,
                  resolution: selectedVariant.madeToOrderResolution,
                  quantity: madeToOrderQty,
                  customizationEnabled: false,
                  customizationSurcharge,
                  customizationNumber: null,
                  customizationName: null,
                });
                addCartLine(expressLine);
                addCartLine(madeToOrderLine);
              } else {
                const line = createCartLineFromSelection({
                  productId,
                  productSlug,
                  variantId: selectedVariant.id,
                  title,
                  imageUrl,
                  imageAlt,
                  size: selectedVariant.sizeLabel,
                  resolution: selectedResolution,
                  quantity,
                  customizationEnabled: isCustomizedSelection,
                  customizationSurcharge,
                  customizationNumber: isCustomizedSelection ? customizationNumber : null,
                  customizationName: isCustomizedSelection ? trimmedCustomizationName : null,
                });
                addCartLine(line);
              }
              setAddFeedback({
                type: "success",
                message: isMixedSplit
                  ? `Se agregaron ${selectedVariant.expressStock} unidad${
                      selectedVariant.expressStock === 1 ? "" : "es"
                    } express y ${quantity - selectedVariant.expressStock} por encargo al carrito.`
                  : quantity > 1
                    ? `Se agregaron ${quantity} unidades al carrito.`
                    : "Producto agregado al carrito.",
              });
            } catch (error) {
              const message =
                error instanceof Error
                  ? error.message
                  : "No se pudo agregar el producto al carrito.";
              setAddFeedback({ type: "error", message });
            }
          }}
          className="inline-flex min-h-11 w-full items-center justify-center rounded-md bg-sky-500 px-4 text-sm font-semibold text-white transition hover:bg-sky-600 disabled:cursor-not-allowed disabled:bg-zinc-200 disabled:text-zinc-500 dark:disabled:bg-neutral-800 dark:disabled:text-neutral-500"
          disabled={!canSubmit}
        >
          {canAddToCart ? "Agregar al carrito" : "No disponible"}
        </button>
        {addFeedback ? (
          <p
            className={`rounded-md border px-2.5 py-2 text-xs ${
              addFeedback.type === "success"
                ? "border-sky-200 bg-sky-50 text-sky-900 dark:border-sky-500/25 dark:bg-sky-950/20 dark:text-sky-300"
                : "border-red-200 bg-red-50 text-red-800 dark:border-red-500/25 dark:bg-red-950/20 dark:text-red-300"
            }`}
          >
            {addFeedback.message}
          </p>
        ) : null}
        <div className="space-y-1 text-center text-xs text-zinc-500 dark:text-neutral-500">
          <p>Pago seguro con Mercado Pago.</p>
          <p>Podés revisar todo antes de pagar.</p>
        </div>
      </div>

      <div className="space-y-2 border-t border-zinc-200 pt-3 dark:border-white/10">
        <p className="text-xs font-medium text-zinc-800 dark:text-neutral-200">Confianza y logística</p>
        <ul className="space-y-1.5 text-xs text-zinc-600 dark:text-neutral-400">
          {trustItems.map((item) => (
            <li key={item} className="flex items-start gap-2">
              <span className="mt-1 inline-flex h-1.5 w-1.5 shrink-0 rounded-full bg-sky-400/80" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-[11px] leading-relaxed text-zinc-600 dark:border-white/10 dark:bg-neutral-950/65 dark:text-neutral-500">
        Todos nuestros productos importados de China cumplen con las normativas legales locales.
        Garantizamos una compra segura y transparente, gestionando los impuestos y aranceles
        conforme a la ley de cada país.
      </div>
    </section>
  );
}
