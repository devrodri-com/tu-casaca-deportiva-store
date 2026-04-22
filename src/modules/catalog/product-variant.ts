export type ProductVariant = {
  id: string;
  productId: string;
  size: string;
  expressStock: number;
  allowMadeToOrder: boolean;
  madeToOrderMinDays: number | null;
  madeToOrderMaxDays: number | null;
};

export function isValidMadeToOrderRange(variant: ProductVariant): boolean {
  if (!variant.allowMadeToOrder) {
    return true;
  }
  const { madeToOrderMinDays: min, madeToOrderMaxDays: max } = variant;
  if (min === null || max === null) {
    return false;
  }
  if (!Number.isInteger(min) || !Number.isInteger(max)) {
    return false;
  }
  if (min < 1 || max < 1) {
    return false;
  }
  return min <= max;
}
