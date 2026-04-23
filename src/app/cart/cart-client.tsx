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
    return <p className="tcds-prose">Carrito vacío.</p>;
  }

  return (
    <section className="flex flex-col gap-3">
      <ul className="flex flex-col gap-2">
        {lines.map((line, index) => (
          <li
            key={`${line.productId}-${line.variantId}-${line.customization?.isCustomized ?? false}-${line.customization?.jerseyNumber ?? ""}-${line.customization?.jerseyName ?? ""}-${index}`}
            className="tcds-card p-3 text-sm"
          >
            <p>title: {line.title}</p>
            <p>size: {line.size}</p>
            <p>
              customization:{" "}
              {line.customization
                ? `sí (+${line.customization.surchargeAmount})`
                : "no"}
            </p>
            {line.customization ? (
              <p>
                detalle: #{line.customization.jerseyNumber} · {line.customization.jerseyName}
              </p>
            ) : null}
            <p>fulfillment: {line.fulfillment}</p>
            <p>
              promisedDays: {String(line.promisedDays.minDays)} /{" "}
              {String(line.promisedDays.maxDays)}
            </p>
            <p>finalUnitPrice: {line.finalUnitPrice}</p>
            <p>quantity: {line.quantity}</p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
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
                      fulfillment: line.fulfillment,
                      isCustomized: line.customization?.isCustomized ?? false,
                      customizationNumber: line.customization?.jerseyNumber ?? null,
                      customizationName: line.customization?.jerseyName ?? null,
                    },
                    nextQuantity
                  );
                  setLines(getCartLines());
                }}
                className="tcds-btn-secondary min-w-8 px-2"
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
                      fulfillment: line.fulfillment,
                      isCustomized: line.customization?.isCustomized ?? false,
                      customizationNumber: line.customization?.jerseyNumber ?? null,
                      customizationName: line.customization?.jerseyName ?? null,
                    },
                    line.quantity + 1
                  );
                  setLines(getCartLines());
                }}
                className="tcds-btn-secondary min-w-8 px-2"
              >
                +
              </button>
              <button
                type="button"
                onClick={() => {
                  removeCartLine({
                    productId: line.productId,
                    variantId: line.variantId,
                    fulfillment: line.fulfillment,
                    isCustomized: line.customization?.isCustomized ?? false,
                    customizationNumber: line.customization?.jerseyNumber ?? null,
                    customizationName: line.customization?.jerseyName ?? null,
                  });
                  setLines(getCartLines());
                }}
                className="tcds-btn-secondary"
              >
                Remover
              </button>
            </div>
          </li>
        ))}
      </ul>
      <p className="text-sm font-medium text-foreground">total: {total}</p>
    </section>
  );
}
