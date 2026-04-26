import assert from "node:assert/strict";
import { test } from "node:test";
import {
  isAwaitingPaymentPossibleAbandonment,
  AWAITING_PAYMENT_STALE_MINUTES,
  getAdminOrderAttention,
} from "@/app/admin/orders/_lib/admin-order-helpers";
import type { Database } from "@/lib/supabase/database.types";

const BASE_NOW = new Date("2026-04-25T14:00:00.000Z");

function isoMinutesAgo(minutes: number): string {
  return new Date(BASE_NOW.getTime() - minutes * 60 * 1000).toISOString();
}

type OrderRow = Database["public"]["Tables"]["orders"]["Row"];

function makeOrderRow(params: {
  paymentStatus: OrderRow["payment_status"];
  createdAt: string;
}): OrderRow {
  return {
    id: "o-1",
    public_reference: "REF1234567890AB",
    total: "1000",
    customer_full_name: "Cliente Test",
    customer_phone: "099111222",
    customer_email: null,
    customer_address: "Calle 1",
    customer_city: "Centro",
    customer_department: "Montevideo",
    customer_country: "Uruguay",
    checkout_idempotency_key: null,
    payment_status: params.paymentStatus,
    mercado_pago_preference_id: null,
    mercado_pago_payment_id: null,
    mercado_pago_status: null,
    paid_at: null,
    stock_discounted_at: null,
    operational_status: null,
    operational_updated_at: null,
    created_at: params.createdAt,
  };
}

test("awaiting_payment 5 min no es posible abandono", () => {
  const result = isAwaitingPaymentPossibleAbandonment({
    paymentStatus: "awaiting_payment",
    createdAt: isoMinutesAgo(5),
    now: BASE_NOW,
  });
  assert.equal(result, false);
});

test("awaiting_payment 45 min es posible abandono", () => {
  const result = isAwaitingPaymentPossibleAbandonment({
    paymentStatus: "awaiting_payment",
    createdAt: isoMinutesAgo(45),
    now: BASE_NOW,
  });
  assert.equal(result, true);
  assert.equal(AWAITING_PAYMENT_STALE_MINUTES, 30);
});

test("pending, paid y failed nunca se clasifican como abandono", () => {
  const createdAt = isoMinutesAgo(45);
  assert.equal(
    isAwaitingPaymentPossibleAbandonment({
      paymentStatus: "pending",
      createdAt,
      now: BASE_NOW,
    }),
    false
  );
  assert.equal(
    isAwaitingPaymentPossibleAbandonment({
      paymentStatus: "paid",
      createdAt,
      now: BASE_NOW,
    }),
    false
  );
  assert.equal(
    isAwaitingPaymentPossibleAbandonment({
      paymentStatus: "failed",
      createdAt,
      now: BASE_NOW,
    }),
    false
  );
});

test("getAdminOrderAttention: awaiting_payment reciente mantiene mensaje normal", () => {
  const order = makeOrderRow({
    paymentStatus: "awaiting_payment",
    createdAt: isoMinutesAgo(5),
  });
  const attention = getAdminOrderAttention(order, BASE_NOW);
  assert.equal(attention.kind, "payment_incomplete");
  assert.match(attention.body, /Pago sin confirmar/);
  assert.doesNotMatch(attention.body, /Posible abandono/);
});

test("getAdminOrderAttention: awaiting_payment viejo marca posible abandono con edad", () => {
  const order = makeOrderRow({
    paymentStatus: "awaiting_payment",
    createdAt: isoMinutesAgo(45),
  });
  const attention = getAdminOrderAttention(order, BASE_NOW);
  assert.equal(attention.kind, "payment_incomplete");
  assert.match(attention.body, /Posible abandono/);
  assert.match(attention.body, /45 min/);
  assert.match(attention.body, /No operar/);
});

test("getAdminOrderAttention: pending viejo no se marca como posible abandono", () => {
  const order = makeOrderRow({
    paymentStatus: "pending",
    createdAt: isoMinutesAgo(45),
  });
  const attention = getAdminOrderAttention(order, BASE_NOW);
  assert.equal(attention.kind, "payment_incomplete");
  assert.match(attention.body, /Pago sin confirmar/);
  assert.doesNotMatch(attention.body, /Posible abandono/);
});
