"use client";

import { useMemo, useState } from "react";
import type { CartLine } from "@/modules/cart";
import { getCartLines } from "@/modules/cart";

export function CartClient() {
  const [lines] = useState<CartLine[]>(() => getCartLines());

  const total = useMemo(
    () =>
      lines.reduce(
        (accumulator, line) => accumulator + line.finalUnitPrice * line.quantity,
        0
      ),
    [lines]
  );

  if (lines.length === 0) {
    return <p className="text-sm text-foreground/80">Carrito vacío.</p>;
  }

  return (
    <section className="flex flex-col gap-3">
      <ul className="flex flex-col gap-2">
        {lines.map((line, index) => (
          <li
            key={`${line.productId}-${line.variantId}-${line.customization?.isCustomized ?? false}-${index}`}
            className="rounded border p-3 text-sm"
          >
            <p>title: {line.title}</p>
            <p>size: {line.size}</p>
            <p>
              customization:{" "}
              {line.customization
                ? `sí (+${line.customization.surchargeAmount})`
                : "no"}
            </p>
            <p>fulfillment: {line.fulfillment}</p>
            <p>
              promisedDays: {String(line.promisedDays.minDays)} /{" "}
              {String(line.promisedDays.maxDays)}
            </p>
            <p>finalUnitPrice: {line.finalUnitPrice}</p>
            <p>quantity: {line.quantity}</p>
          </li>
        ))}
      </ul>
      <p className="text-sm font-medium">total: {total}</p>
    </section>
  );
}
