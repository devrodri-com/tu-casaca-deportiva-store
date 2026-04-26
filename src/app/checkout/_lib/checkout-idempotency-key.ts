import type { CartLine } from "@/modules/cart";

export const CHECKOUT_IDEMPOTENCY_STORAGE_KEY = "tcds_checkout_idempotency_key";
export const CHECKOUT_CART_SIGNATURE_STORAGE_KEY = "tcds_checkout_cart_signature";

let inMemoryCheckoutIdempotencyKey: string | null = null;
let inMemoryCheckoutCartSignature: string | null = null;

function generateCheckoutIdempotencyKey(): string {
  if (typeof globalThis.crypto?.randomUUID === "function") {
    return globalThis.crypto.randomUUID();
  }
  return `ck_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 14)}`;
}

export function getOrCreateCheckoutIdempotencyKey(): string {
  if (typeof window === "undefined") {
    if (inMemoryCheckoutIdempotencyKey) {
      return inMemoryCheckoutIdempotencyKey;
    }
    const generated = generateCheckoutIdempotencyKey();
    inMemoryCheckoutIdempotencyKey = generated;
    return generated;
  }

  try {
    const stored = window.localStorage.getItem(CHECKOUT_IDEMPOTENCY_STORAGE_KEY);
    if (stored && stored.trim().length > 0) {
      return stored;
    }
    const generated = generateCheckoutIdempotencyKey();
    window.localStorage.setItem(CHECKOUT_IDEMPOTENCY_STORAGE_KEY, generated);
    return generated;
  } catch {
    if (inMemoryCheckoutIdempotencyKey) {
      return inMemoryCheckoutIdempotencyKey;
    }
    const generated = generateCheckoutIdempotencyKey();
    inMemoryCheckoutIdempotencyKey = generated;
    return generated;
  }
}

function buildCartLineSignaturePart(line: CartLine): string {
  const customizationNumber = (line.customization?.jerseyNumber ?? "").trim();
  const customizationName = (line.customization?.jerseyName ?? "").trim();
  return [
    line.productId,
    line.variantId,
    line.fulfillment,
    String(line.quantity),
    customizationNumber,
    customizationName,
  ].join("|");
}

export function buildCheckoutCartSignature(lines: CartLine[]): string {
  return lines
    .map((line) => buildCartLineSignaturePart(line))
    .sort((a, b) => a.localeCompare(b))
    .join("||");
}

export function getOrCreateCheckoutIdempotencyKeyForLines(lines: CartLine[]): string {
  const nextSignature = buildCheckoutCartSignature(lines);

  if (typeof window === "undefined") {
    if (
      inMemoryCheckoutIdempotencyKey &&
      inMemoryCheckoutCartSignature === nextSignature
    ) {
      return inMemoryCheckoutIdempotencyKey;
    }
    const generated = generateCheckoutIdempotencyKey();
    inMemoryCheckoutIdempotencyKey = generated;
    inMemoryCheckoutCartSignature = nextSignature;
    return generated;
  }

  try {
    const storedKey = window.localStorage.getItem(CHECKOUT_IDEMPOTENCY_STORAGE_KEY);
    const storedSignature = window.localStorage.getItem(
      CHECKOUT_CART_SIGNATURE_STORAGE_KEY
    );

    if (
      storedKey &&
      storedKey.trim().length > 0 &&
      storedSignature === nextSignature
    ) {
      return storedKey;
    }

    const generated = generateCheckoutIdempotencyKey();
    window.localStorage.setItem(CHECKOUT_IDEMPOTENCY_STORAGE_KEY, generated);
    window.localStorage.setItem(CHECKOUT_CART_SIGNATURE_STORAGE_KEY, nextSignature);
    return generated;
  } catch {
    if (
      inMemoryCheckoutIdempotencyKey &&
      inMemoryCheckoutCartSignature === nextSignature
    ) {
      return inMemoryCheckoutIdempotencyKey;
    }
    const generated = generateCheckoutIdempotencyKey();
    inMemoryCheckoutIdempotencyKey = generated;
    inMemoryCheckoutCartSignature = nextSignature;
    return generated;
  }
}

export function clearCheckoutIdempotencyKey(): void {
  inMemoryCheckoutIdempotencyKey = null;
  inMemoryCheckoutCartSignature = null;
  if (typeof window === "undefined") {
    return;
  }
  try {
    window.localStorage.removeItem(CHECKOUT_IDEMPOTENCY_STORAGE_KEY);
    window.localStorage.removeItem(CHECKOUT_CART_SIGNATURE_STORAGE_KEY);
  } catch {
    // Ignorado: fallback en memoria ya está reseteado.
  }
}
