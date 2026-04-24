import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { resolvePurchasableLine, resolvePurchasableLineForCheckout, assertExpressLinesWithinStock } from "@/modules/purchase/purchasable-line";
import { baseProduct, variantExpress, variantExpressAndMto, variantMto, variantUnavailable } from "../factories/domains";

describe("resolvePurchasableLine", () => {
  it("con expressStock > 0 resuelve express sin personalización", () => {
    const v = variantExpress();
    const out = resolvePurchasableLine({
      product: baseProduct,
      variant: v,
      unitBasePrice: 1000,
      customization: { isCustomized: false, surchargeAmount: 0 },
    });
    assert.equal(out.fulfillment, "express");
    assert.deepEqual(out.promisedDays, { minDays: 0, maxDays: 2 });
  });

  it("sin express pero con encargo y rango válido resuelve made_to_order", () => {
    const v = variantMto();
    const out = resolvePurchasableLine({
      product: baseProduct,
      variant: v,
      unitBasePrice: 1000,
      customization: { isCustomized: false, surchargeAmount: 0 },
    });
    assert.equal(out.fulfillment, "made_to_order");
    assert.equal(out.promisedDays.minDays, 14);
    assert.equal(out.promisedDays.maxDays, 21);
  });

  it("sin express ni encargo resuelve unavailable", () => {
    const v = variantUnavailable();
    const out = resolvePurchasableLine({
      product: baseProduct,
      variant: v,
      unitBasePrice: 1000,
      customization: { isCustomized: false, surchargeAmount: 0 },
    });
    assert.equal(out.fulfillment, "unavailable");
  });

  it("con personalización fuerza made_to_order aunque haya stock express", () => {
    const v = variantExpressAndMto();
    const out = resolvePurchasableLine({
      product: baseProduct,
      variant: v,
      unitBasePrice: 1000,
      customization: { isCustomized: true, surchargeAmount: 200 },
    });
    assert.equal(out.fulfillment, "made_to_order");
    assert.equal(out.finalUnitPrice, 1200);
  });
});

describe("resolvePurchasableLineForCheckout", () => {
  const mto = variantExpressAndMto();
  const baseInput = {
    product: baseProduct,
    variant: mto,
    unitBasePrice: 1000,
    customization: { isCustomized: false, surchargeAmount: 0 },
  } as const;

  it("mantiene made_to_order aunque haya stock express", () => {
    const out = resolvePurchasableLineForCheckout(
      { ...baseInput, customization: { isCustomized: false, surchargeAmount: 0 } },
      { requestedFulfillment: "made_to_order", quantity: 1 }
    );
    assert.equal(out.fulfillment, "made_to_order");
  });

  it("solicita express sin stock: lanza", () => {
    const v = variantMto();
    assert.throws(
      () =>
        resolvePurchasableLineForCheckout(
          { product: baseProduct, variant: v, unitBasePrice: 1000, customization: { isCustomized: false, surchargeAmount: 0 } },
          { requestedFulfillment: "express", quantity: 1 }
        ),
      /No hay unidades/
    );
  });

  it("con personalización fuerza MTO aunque requested sea express", () => {
    const v = variantExpressAndMto();
    const out = resolvePurchasableLineForCheckout(
      {
        product: baseProduct,
        variant: v,
        unitBasePrice: 1000,
        customization: { isCustomized: true, surchargeAmount: 100 },
      },
      { requestedFulfillment: "express", quantity: 1 }
    );
    assert.equal(out.fulfillment, "made_to_order");
  });

  it("MTO en variante sin encargo: lanza", () => {
    const v = variantExpress();
    assert.throws(
      () =>
        resolvePurchasableLineForCheckout(
          { product: baseProduct, variant: v, unitBasePrice: 100, customization: { isCustomized: false, surchargeAmount: 0 } },
          { requestedFulfillment: "made_to_order", quantity: 1 }
        ),
      /encargo no está habilitado para esta variante/
    );
  });
});

describe("assertExpressLinesWithinStock", () => {
  it("varias líneas express de la misma variante suman demanda; pasa si demanda <= stock", () => {
    const id = "00000000-0000-4000-8000-00000000aa01";
    assertExpressLinesWithinStock(
      [
        { variantId: id, fulfillment: "express", quantity: 2 },
        { variantId: id, fulfillment: "express", quantity: 1 },
        { variantId: id, fulfillment: "made_to_order", quantity: 5 },
      ],
      new Map([[id, 3]])
    );
  });

  it("rechaza demanda > stock", () => {
    const id = "00000000-0000-4000-8000-00000000aa01";
    assert.throws(
      () =>
        assertExpressLinesWithinStock(
          [
            { variantId: id, fulfillment: "express", quantity: 2 },
            { variantId: id, fulfillment: "express", quantity: 2 },
          ],
          new Map([[id, 3]])
        ),
      /Stock express insuficiente/
    );
  });

  it("MTO no suma a demanda express", () => {
    const id = "00000000-0000-4000-8000-00000000aa01";
    assertExpressLinesWithinStock(
      [
        { variantId: id, fulfillment: "express", quantity: 1 },
        { variantId: id, fulfillment: "made_to_order", quantity: 99 },
      ],
      new Map([[id, 1]])
    );
  });
});
