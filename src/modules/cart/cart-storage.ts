import type { CartLine } from "./cart-line";

const CART_STORAGE_KEY = "tcds_cart_lines";

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
  const existingIndex = lines.findIndex((existing) => {
    const existingCustomized = existing.customization?.isCustomized ?? false;
    const nextCustomized = line.customization?.isCustomized ?? false;

    return (
      existing.productId === line.productId &&
      existing.variantId === line.variantId &&
      existingCustomized === nextCustomized
    );
  });

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
