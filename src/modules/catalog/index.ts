export type {
  CatalogEntity,
  CatalogEntityKind,
  Product,
  ProductEra,
  ProductType,
} from "./product";
export type { ProductVariant } from "./product-variant";
export { isValidMadeToOrderRange } from "./product-variant";
export {
  resolveAvailability,
  type CatalogAvailability,
} from "./availability";
