"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import { CartEmptyState } from "./_components/cart-empty-state";
import { CartLineItem } from "./_components/cart-line-item";
import { CartSummary } from "./_components/cart-summary";
import {
  getCartLines,
  getCartTotal,
  removeCartLine,
  updateCartLineQuantity,
} from "@/modules/cart";

export function CartClient() {
  const [, forceRefresh] = useState(0);
  const isHydrated = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
  const lines = useMemo(() => (isHydrated ? getCartLines() : []), [isHydrated]);

  const total = useMemo(() => getCartTotal(lines), [lines]);
  const totalUnits = useMemo(
    () => lines.reduce((accumulator, line) => accumulator + line.quantity, 0),
    [lines]
  );

  if (!isHydrated) {
    return (
      <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_21rem] lg:items-start">
        <div className="space-y-3">
          <div className="h-40 animate-pulse rounded-2xl border border-white/10 bg-neutral-900/70" />
          <div className="h-40 animate-pulse rounded-2xl border border-white/10 bg-neutral-900/70" />
        </div>
        <div className="h-48 animate-pulse rounded-2xl border border-white/10 bg-neutral-900/70" />
      </section>
    );
  }

  if (lines.length === 0) {
    return <CartEmptyState />;
  }

  return (
    <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_21rem] lg:items-start">
      <ul className="space-y-3">
        {lines.map((line, index) => (
          <CartLineItem
            key={`${line.productId}-${line.variantId}-${line.fulfillment}-${line.customization?.isCustomized ?? false}-${line.customization?.jerseyNumber ?? ""}-${line.customization?.jerseyName ?? ""}-${index}`}
            line={line}
            onDecrease={(identity, nextQuantity) => {
              if (nextQuantity < 1) {
                return;
              }
              updateCartLineQuantity(identity, nextQuantity);
              forceRefresh((prev) => prev + 1);
            }}
            onIncrease={(identity, nextQuantity) => {
              updateCartLineQuantity(identity, nextQuantity);
              forceRefresh((prev) => prev + 1);
            }}
            onRemove={(identity) => {
              removeCartLine(identity);
              forceRefresh((prev) => prev + 1);
            }}
          />
        ))}
      </ul>

      <CartSummary total={total} totalUnits={totalUnits} />
    </section>
  );
}
