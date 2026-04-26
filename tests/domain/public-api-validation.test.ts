import assert from "node:assert/strict";
import { test } from "node:test";
import {
  parseCheckoutConfirmBody,
  parseMercadoPagoPreferenceBody,
  parseMercadoPagoWebhookBody,
  readJsonValue,
} from "@/lib/http/validation";

const baseLine = {
  productId: "p1",
  variantId: "v1",
  title: "Camiseta",
  size: "M",
  fulfillment: "made_to_order" as const,
  promisedDays: { minDays: 10, maxDays: 20 },
  finalUnitPrice: 1000,
  quantity: 1,
  customization: null,
};

const baseCustomer = {
  fullName: "Ana Pérez",
  phone: "099111222",
  email: null,
  address: "Calle 1",
  city: "Centro",
  department: "Montevideo",
  country: "Uruguay" as const,
};

const baseCheckoutIdempotencyKey = "ck_0123456789abcdef0123456789";

test("parseMercadoPagoPreferenceBody rechaza {} y orderId no string", () => {
  const e = parseMercadoPagoPreferenceBody({});
  assert.equal(e.ok, false);
  const e2 = parseMercadoPagoPreferenceBody({ orderId: 123 });
  assert.equal(e2.ok, false);
  const ok = parseMercadoPagoPreferenceBody({ orderId: "abc" });
  assert.equal(ok.ok, true);
  if (ok.ok) {
    assert.equal(ok.value.orderId, "abc");
  }
});

test("parseCheckoutConfirmBody: quantity 1.5, 999 y finalUnitPrice string devuelve ok false", () => {
  const a = parseCheckoutConfirmBody({
    checkoutIdempotencyKey: baseCheckoutIdempotencyKey,
    lines: [{ ...baseLine, quantity: 1.5 }],
    customer: baseCustomer,
  });
  assert.equal(a.ok, false);
  const b = parseCheckoutConfirmBody({
    checkoutIdempotencyKey: baseCheckoutIdempotencyKey,
    lines: [{ ...baseLine, quantity: 999 }],
    customer: baseCustomer,
  });
  assert.equal(b.ok, false);
  const c = parseCheckoutConfirmBody({
    checkoutIdempotencyKey: baseCheckoutIdempotencyKey,
    lines: [{ ...baseLine, finalUnitPrice: "1000" }],
    customer: baseCustomer,
  } as unknown);
  assert.equal(c.ok, false);
});

test("parseCheckoutConfirmBody: isCustomized true y nombre vacío", () => {
  const r = parseCheckoutConfirmBody({
    checkoutIdempotencyKey: baseCheckoutIdempotencyKey,
    lines: [
      {
        ...baseLine,
        customization: {
          isCustomized: true,
          surchargeAmount: 200,
          jerseyNumber: "10",
          jerseyName: "   ",
        },
      },
    ],
    customer: baseCustomer,
  });
  assert.equal(r.ok, false);
});

test("parseCheckoutConfirmBody: checkoutIdempotencyKey requerido y longitud válida", () => {
  const missing = parseCheckoutConfirmBody({
    lines: [baseLine],
    customer: baseCustomer,
  });
  assert.equal(missing.ok, false);

  const short = parseCheckoutConfirmBody({
    checkoutIdempotencyKey: "short-key",
    lines: [baseLine],
    customer: baseCustomer,
  });
  assert.equal(short.ok, false);

  const valid = parseCheckoutConfirmBody({
    checkoutIdempotencyKey: baseCheckoutIdempotencyKey,
    lines: [baseLine],
    customer: baseCustomer,
  });
  assert.equal(valid.ok, true);
  if (valid.ok) {
    assert.equal(valid.value.checkoutIdempotencyKey, baseCheckoutIdempotencyKey);
  }
});

test("parseMercadoPagoWebhookBody: no objeto, type numérico", () => {
  const a = parseMercadoPagoWebhookBody(null);
  assert.equal(a.ok, false);
  const b = parseMercadoPagoWebhookBody({ type: 1 });
  assert.equal(b.ok, false);
  const c = parseMercadoPagoWebhookBody({ type: "payment" });
  assert.equal(c.ok, true);
  if (c.ok) {
    assert.equal(c.value.type, "payment");
    assert.equal(c.value.action, "");
  }
});

test("readJsonValue con cuerpo inválido", async () => {
  const request = new Request("http://localhost/x", {
    method: "POST",
    body: "not json {",
    headers: { "Content-Type": "application/json" },
  });
  const r = await readJsonValue(request);
  assert.equal(r.ok, false);
  if (!r.ok) {
    assert.ok(r.message.length > 0);
  }
});
