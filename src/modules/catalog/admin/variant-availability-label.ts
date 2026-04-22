import type { CatalogAvailability } from "@/modules/catalog";

export function labelVariantAvailability(availability: CatalogAvailability): string {
  switch (availability) {
    case "express":
      return "Express";
    case "made_to_order":
      return "Por encargo";
    default:
      return "No disponible";
  }
}
