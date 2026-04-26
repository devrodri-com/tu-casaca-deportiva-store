"use client";

import { useEffect } from "react";
import { clearCheckoutIdempotencyKey } from "@/app/checkout/_lib/checkout-idempotency-key";

export function CheckoutIdempotencyKeyClearer() {
  useEffect(() => {
    clearCheckoutIdempotencyKey();
  }, []);

  return null;
}
