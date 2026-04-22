import type { CartLine } from "./cart-line";

const CART_STORAGE_KEY = "tcds_cart_lines";

type CartLineIdentity = {
  productId: string;
  variantId: string;
  isCustomized: boolean;
};

function getLineIdentity(line: CartLine): CartLineIdentity {
  return {
    productId: line.productId,
    variantId: line.variantId,
    isCustomized: line.customization?.isCustomized ?? false,
  };
}

function isSameLineIdentity(line: CartLine, identity: CartLineIdentity): boolean {
  const lineIdentity = getLineIdentity(line);
  return (
    lineIdentity.productId === identity.productId &&
    lineIdentity.variantId === identity.variantId &&
    lineIdentity.isCustomized === identity.isCustomized
  );
}

function writeCartLines(lines: CartLine[]): void {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(lines));
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
    return JSON.parse(raw) as CartLine[];
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
