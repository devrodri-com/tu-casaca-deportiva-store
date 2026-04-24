/**
 * Textos de fulfillment para la tienda (PDP, carrito, checkout, pedido, admin).
 * Sin lógica de negocio: solo cadenas consistentes a partir de snapshots / resolución.
 */
export type StorefrontFulfillment =
  | "express"
  | "made_to_order"
  | "unavailable";

const EXPRESS_DELIVERY = "Retiro hoy o envío en 24–48 h";

function isValidMtoRange(
  minDays: number | null,
  maxDays: number | null
): minDays is number {
  return (
    minDays != null &&
    maxDays != null &&
    minDays > 0 &&
    maxDays >= minDays
  );
}

/**
 * Etiqueta corta (chips, tablas): no mostrar claves técnicas en UI pública o admin.
 */
export function fulfillmentShortLabel(
  fulfillment: StorefrontFulfillment
): string {
  if (fulfillment === "express") {
    return "Express";
  }
  if (fulfillment === "made_to_order") {
    return "Por encargo";
  }
  return "Sin disponibilidad";
}

/**
 * Línea secundaria de plazo / entrega (un bloque bajo título o con etiqueta abreviada).
 */
export function fulfillmentDeliveryLine(params: {
  fulfillment: StorefrontFulfillment;
  minDays: number | null;
  maxDays: number | null;
}): string {
  if (params.fulfillment === "express") {
    return EXPRESS_DELIVERY;
  }
  if (params.fulfillment === "made_to_order") {
    if (isValidMtoRange(params.minDays, params.maxDays)) {
      return `Entrega estimada en ${params.minDays}–${params.maxDays} días`;
    }
    return "Entrega según plazo de encargo (típico 14–21 días).";
  }
  return "Plazo de entrega a confirmar según disponibilidad y stock.";
}

/**
 * Misma intención que en líneas de listado: `Express · (texto de entrega)`.
 */
export function fulfillmentListCompactLine(params: {
  fulfillment: StorefrontFulfillment;
  minDays: number | null;
  maxDays: number | null;
}): string {
  return `${fulfillmentShortLabel(params.fulfillment)} · ${fulfillmentDeliveryLine(params)}`;
}

/**
 * { shortLabel, deliveryLine } usado en resumen de pedido público.
 */
export function fulfillmentSummaryParts(params: {
  fulfillment: StorefrontFulfillment;
  minDays: number | null;
  maxDays: number | null;
}): { shortLabel: string; deliveryLine: string } {
  return {
    shortLabel: fulfillmentShortLabel(params.fulfillment),
    deliveryLine: fulfillmentDeliveryLine(params),
  };
}

/**
 * Nota fija: personalización implica encargo.
 */
export const FULFILLMENT_CUSTOMIZATION_TO_MADE_TO_ORDER = `Al personalizar, el pedido pasa a modalidad por encargo.`;

type ResolutionLike = {
  fulfillment: StorefrontFulfillment;
  promisedDays: { minDays: number | null; maxDays: number | null };
};

/**
 * Texto bajo el precio en la PDP: cubre talle no disponible, flujo con personalización y
 * express / encargo estándar.
 */
export function fulfillmentPdpMainMessage(params: {
  resolution: ResolutionLike;
  isUnavailable: boolean;
  isCustomized: boolean;
}): string {
  if (params.isUnavailable) {
    return fulfillmentDeliveryLine({
      fulfillment: "unavailable",
      minDays: null,
      maxDays: null,
    });
  }
  if (params.isCustomized) {
    return `Con personalización: ${fulfillmentDeliveryLine({
      fulfillment: "made_to_order",
      minDays: params.resolution.promisedDays.minDays,
      maxDays: params.resolution.promisedDays.maxDays,
    })}`;
  }
  return fulfillmentDeliveryLine({
    fulfillment: params.resolution.fulfillment,
    minDays: params.resolution.promisedDays.minDays,
    maxDays: params.resolution.promisedDays.maxDays,
  });
}

/**
 * Sufijo para admin / lista compacta: ` · 10–20 días háb.` o vacío.
 */
export function fulfillmentPromisedHabilesRangeSuffix(
  minDays: number | null,
  maxDays: number | null
): string {
  if (isValidMtoRange(minDays, maxDays)) {
    return ` · ${minDays}–${maxDays} días háb.`;
  }
  return "";
}
