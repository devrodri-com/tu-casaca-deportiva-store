import type { CartLine } from "./cart-line";

const CART_STORAGE_KEY = "tcds_cart_lines";

type CartLineIdentity = {
  productId: string;
  variantId: string;
  fulfillment: CartLine["fulfillment"];
  isCustomized: boolean;
  customizationNumber: string | null;
  customizationName: string | null;
};

function getLineIdentity(line: CartLine): CartLineIdentity {
  return {
    productId: line.productId,
    variantId: line.variantId,
    fulfillment: line.fulfillment,
    isCustomized: line.customization?.isCustomized ?? false,
    customizationNumber: line.customization?.jerseyNumber ?? null,
    customizationName: line.customization?.jerseyName ?? null,
  };
}

function isSameLineIdentity(line: CartLine, identity: CartLineIdentity): boolean {
  const lineIdentity = getLineIdentity(line);
  return (
    lineIdentity.productId === identity.productId &&
    lineIdentity.variantId === identity.variantId &&
    lineIdentity.fulfillment === identity.fulfillment &&
    lineIdentity.isCustomized === identity.isCustomized &&
    lineIdentity.customizationNumber === identity.customizationNumber &&
    lineIdentity.customizationName === identity.customizationName
  );
}

function writeCartLines(lines: CartLine[]): void {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(lines));
}

type PersistedCartLine = Partial<CartLine> & {
  primaryImageUrl?: string | null;
  primaryImageAlt?: string | null;
};

function normalizeCartLine(raw: PersistedCartLine): CartLine | null {
  if (
    typeof raw.productId !== "string" ||
    typeof raw.variantId !== "string" ||
    typeof raw.title !== "string" ||
    typeof raw.size !== "string" ||
    (raw.fulfillment !== "express" &&
      raw.fulfillment !== "made_to_order" &&
      raw.fulfillment !== "unavailable") ||
    !raw.promisedDays ||
    typeof raw.promisedDays.minDays !== "number" && raw.promisedDays.minDays !== null ||
    typeof raw.promisedDays.maxDays !== "number" && raw.promisedDays.maxDays !== null ||
    typeof raw.finalUnitPrice !== "number" ||
    typeof raw.quantity !== "number"
  ) {
    return null;
  }

  const imageUrl =
    typeof raw.imageUrl === "string"
      ? raw.imageUrl
      : raw.imageUrl === null
        ? null
        : typeof raw.primaryImageUrl === "string"
          ? raw.primaryImageUrl
          : raw.primaryImageUrl === null
            ? null
            : null;
  const imageAlt =
    typeof raw.imageAlt === "string"
      ? raw.imageAlt
      : raw.imageAlt === null
        ? null
        : typeof raw.primaryImageAlt === "string"
          ? raw.primaryImageAlt
          : raw.primaryImageAlt === null
            ? null
            : null;

  return {
    productId: raw.productId,
    variantId: raw.variantId,
    title: raw.title,
    imageUrl,
    imageAlt,
    size: raw.size,
    fulfillment: raw.fulfillment,
    promisedDays: {
      minDays: raw.promisedDays.minDays,
      maxDays: raw.promisedDays.maxDays,
    },
    finalUnitPrice: raw.finalUnitPrice,
    customization: raw.customization ?? null,
    quantity: raw.quantity,
  };
}

export function getCartLines(): CartLine[] {
  if (typeof window === "undefined") {
    return [];
  }

  const raw = window.localStorage.getItem(CART_STORAGE_KEY);
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw) as PersistedCartLine[];
    return parsed
      .map((line) => normalizeCartLine(line))
      .filter((line): line is CartLine => line !== null);
  } catch {
    return [];
  }
}

export function addCartLine(line: CartLine): void {
  const lines = getCartLines();
  const existingIndex = lines.findIndex((existing) =>
    isSameLineIdentity(existing, getLineIdentity(line))
  );

  if (existingIndex === -1) {
    writeCartLines([...lines, line]);
    return;
  }

  const updated = [...lines];
  const existing = updated[existingIndex];
  updated[existingIndex] = {
    ...existing,
    imageUrl: existing.imageUrl ?? line.imageUrl,
    imageAlt: existing.imageAlt ?? line.imageAlt,
    quantity: existing.quantity + line.quantity,
  };
  writeCartLines(updated);
}

export function removeCartLine(identity: CartLineIdentity): void {
  const lines = getCartLines();
  const updated = lines.filter((line) => !isSameLineIdentity(line, identity));
  writeCartLines(updated);
}

export function updateCartLineQuantity(
  identity: CartLineIdentity,
  quantity: number
): void {
  if (quantity < 1) {
    throw new Error("quantity must be >= 1");
  }

  const lines = getCartLines();
  const index = lines.findIndex((line) => isSameLineIdentity(line, identity));
  if (index === -1) {
    return;
  }

  const updated = [...lines];
  updated[index] = {
    ...updated[index],
    quantity,
  };
  writeCartLines(updated);
}

export function getCartTotal(lines: CartLine[]): number {
  return lines.reduce(
    (accumulator, line) => accumulator + line.finalUnitPrice * line.quantity,
    0
  );
}
