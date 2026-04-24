import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { CartLine } from "@/modules/cart";
import { buildOrderFromCart } from "@/modules/orders/order";

const customer = {
  fullName: "Juan Pérez",
  phone: "099123456",
  email: "j@e.com" as const,
  address: "Calle 1",
  city: "Montevideo",
  department: "Montevideo" as const,
  country: "Uruguay" as const,
};

function line(over: Partial<CartLine> = {}): CartLine {
  return {
    productId: "p1",
    variantId: "v1",
    title: "Camiseta",
    imageUrl: null,
    imageAlt: null,
    size: "M",
    fulfillment: "express",
    promisedDays: { minDays: 0, maxDays: 2 },
    finalUnitPrice: 1000,
    quantity: 2,
    customization: null,
    ...over,
  };
}

describe("buildOrderFromCart", () => {
  it("calcula total como suma de subtotales", () => {
    const order = buildOrderFromCart({
      id: "o1",
      publicReference: "aabbccdd",
      customer,
      lines: [
        line({ finalUnitPrice: 100, quantity: 2 }),
        line({ productId: "p2", finalUnitPrice: 50, quantity: 4, variantId: "v2" }),
      ],
    });
    assert.equal(order.total, 100 * 2 + 50 * 4);
  });

  it("persiste snapshot de fulfillment y días de la línea", () => {
    const order = buildOrderFromCart({
      id: "o1",
      publicReference: "ref1",
      customer,
      lines: [
        line({
          fulfillment: "made_to_order",
          promisedDays: { minDays: 14, maxDays: 21 },
        }),
      ],
    });
    const item = order.items[0];
    assert.equal(item.fulfillmentSnapshot, "made_to_order");
    assert.equal(item.promisedDays.minDays, 14);
    assert.equal(item.promisedDays.maxDays, 21);
  });

  it("persiste personalización con jerseyNumber y jerseyName", () => {
    const order = buildOrderFromCart({
      id: "o1",
      publicReference: "ref1",
      customer,
      lines: [
        line({
          customization: {
            isCustomized: true,
            surchargeAmount: 200,
            jerseyNumber: "7",
            jerseyName: "Ronaldo",
          },
        }),
      ],
    });
    const snap = order.items[0].customizationSnapshot;
    assert(snap);
    assert.equal(snap.jerseyNumber, "7");
    assert.equal(snap.jerseyName, "Ronaldo");
    assert.equal(snap.surchargeAmount, 200);
  });

  it("línea sin personalización: customizationSnapshot null", () => {
    const order = buildOrderFromCart({
      id: "o1",
      publicReference: "r",
      customer,
      lines: [line({ customization: null })],
    });
    assert.equal(order.items[0].customizationSnapshot, null);
  });
});
