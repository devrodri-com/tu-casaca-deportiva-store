import assert from "node:assert/strict";
import { test } from "node:test";
import {
  FULFILLMENT_CUSTOMIZATION_TO_MADE_TO_ORDER,
  fulfillmentListCompactLine,
  fulfillmentShortLabel,
} from "@/modules/orders/application/fulfillment-presentation";

test("etiqueta corta y listado coheren con resumen de pedido", () => {
  assert.equal(fulfillmentShortLabel("express"), "Express");
  assert.equal(fulfillmentShortLabel("made_to_order"), "Por encargo");
  assert.equal(fulfillmentShortLabel("unavailable"), "Sin disponibilidad");
  const line = fulfillmentListCompactLine({
    fulfillment: "express",
    minDays: null,
    maxDays: null,
  });
  assert.equal(line, "Express · Retiro hoy o envío en 24–48 h");
  assert.equal(
    FULFILLMENT_CUSTOMIZATION_TO_MADE_TO_ORDER,
    "Al personalizar, el pedido pasa a modalidad por encargo."
  );
});
