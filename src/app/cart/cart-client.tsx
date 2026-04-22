"use client";

import { useMemo, useState } from "react";
import type { CartLine } from "@/modules/cart";
import {
  getCartLines,
  getCartTotal,
  removeCartLine,
  updateCartLineQuantity,
} from "@/modules/cart";

export function CartClient() {
  const [lines, setLines] = useState<CartLine[]>(() => getCartLines());

  const total = useMemo(
    () => getCartTotal(lines),
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
            <div className="mt-2 flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  const nextQuantity = line.quantity - 1;
                  if (nextQuantity < 1) {
                    return;
                  }
                  updateCartLineQuantity(
                    {
                      productId: line.productId,
                      variantId: line.variantId,
                      isCustomized: line.customization?.isCustomized ?? false,
                    },
                    nextQuantity
                  );
                  setLines(getCartLines());
                }}
                className="rounded border px-2 py-1"
                disabled={line.quantity <= 1}
              >
                -
              </button>
              <button
                type="button"
                onClick={() => {
                  updateCartLineQuantity(
                    {
                      productId: line.productId,
                      variantId: line.variantId,
                      isCustomized: line.customization?.isCustomized ?? false,
                    },
                    line.quantity + 1
                  );
                  setLines(getCartLines());
                }}
                className="rounded border px-2 py-1"
              >
                +
              </button>
              <button
                type="button"
                onClick={() => {
                  removeCartLine({
                    productId: line.productId,
                    variantId: line.variantId,
                    isCustomized: line.customization?.isCustomized ?? false,
                  });
                  setLines(getCartLines());
                }}
                className="rounded border px-2 py-1"
              >
                Remover
              </button>
            </div>
          </li>
        ))}
      </ul>
      <p className="text-sm font-medium">total: {total}</p>
    </section>
  );
}
