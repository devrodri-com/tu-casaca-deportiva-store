import type { CatalogAvailability } from "@/modules/catalog";
import { fulfillmentShortLabel } from "@/modules/orders/application/fulfillment-presentation";

export function labelVariantAvailability(availability: CatalogAvailability): string {
  return fulfillmentShortLabel(availability);
}
