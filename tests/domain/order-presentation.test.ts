import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { customizationDisplayLine, fulfillmentAndDeliveryText } from "@/modules/orders/application/order-presentation";
import type { Json } from "@/lib/supabase/database.types";

describe("order-presentation", () => {
  describe("customizationDisplayLine", () => {
    it("con number y name muestra # y nombre", () => {
      const j: Json = {
        isCustomized: true,
        jerseyNumber: "7",
        jerseyName: "Ronaldo",
        surchargeAmount: 200,
      };
      assert.equal(
        customizationDisplayLine(j),
        "Personalización: #7 · Ronaldo"
      );
    });

    it("con solo isCustomized: true (JSON viejo) devuelve fallback", () => {
      const j: Json = { isCustomized: true, surchargeAmount: 150 };
      assert.equal(
        customizationDisplayLine(j),
        "Incluye personalización (dorsal y nombre)."
      );
    });
  });

  describe("fulfillmentAndDeliveryText", () => {
    it("express: etiqueta y línea alineada con helpers", () => {
      const r = fulfillmentAndDeliveryText({
        fulfillment: "express",
        minDays: null,
        maxDays: null,
      });
      assert.equal(r.shortLabel, "Express");
      assert.equal(r.deliveryLine, "Retiro hoy o envío en 24–48 h");
    });

    it("encargo: rango de días con guión de rango", () => {
      const r = fulfillmentAndDeliveryText({
        fulfillment: "made_to_order",
        minDays: 14,
        maxDays: 21,
      });
      assert.equal(r.shortLabel, "Por encargo");
      assert.equal(
        r.deliveryLine,
        "Entrega estimada en 14–21 días"
      );
    });
  });
});
