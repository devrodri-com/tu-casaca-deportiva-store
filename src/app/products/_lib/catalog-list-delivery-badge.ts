import {
  fulfillmentShortLabel,
  type StorefrontFulfillment,
} from "@/modules/orders/application/fulfillment-presentation";

/**
 * Clases de badge de disponibilidad en grilla de productos (listado / home).
 * Estilos por clave de fulfillment, no por texto.
 */
export function catalogListDeliveryBadgeClassName(
  kind: StorefrontFulfillment
): string {
  switch (kind) {
    case "express":
      return "border border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-800/50 dark:bg-emerald-950/50 dark:text-emerald-300";
    case "made_to_order":
      return "border border-sky-300 bg-sky-50 text-sky-900 dark:border-sky-800/40 dark:bg-sky-950/40 dark:text-sky-200";
    default:
      return "border border-zinc-300 bg-zinc-100 text-zinc-700 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-400";
  }
}

export function catalogListDeliveryBadgeLabel(
  kind: StorefrontFulfillment
): string {
  return fulfillmentShortLabel(kind);
}
