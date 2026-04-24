import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { Database } from "@/lib/supabase/database.types";
import { buildMercadoPagoPreferencePayload } from "@/modules/payments/mercado-pago";

type OrderRow = Database["public"]["Tables"]["orders"]["Row"];
type OrderItemRow = Database["public"]["Tables"]["order_items"]["Row"];

type PreferencePayload = {
  items: Array<{
    title: string;
    quantity: number;
    unit_price: number;
    currency_id: string;
  }>;
  external_reference: string;
  notification_url: string;
  back_urls: {
    success: string;
    pending: string;
    failure: string;
  };
  payer?: { email: string };
};

function makeOrder(overrides: Partial<OrderRow> = {}): OrderRow {
  return {
    id: "00000000-0000-4000-8000-000000000111",
    public_reference: "abcd1234",
    total: "2590",
    customer_full_name: "Juan Perez",
    customer_phone: "099123456",
    customer_email: "juan@test.com",
    customer_address: "Calle 1",
    customer_city: "Montevideo",
    customer_department: "Montevideo",
    customer_country: "Uruguay",
    payment_status: "awaiting_payment",
    mercado_pago_preference_id: null,
    mercado_pago_payment_id: null,
    mercado_pago_status: null,
    paid_at: null,
    stock_discounted_at: null,
    operational_status: null,
    operational_updated_at: null,
    created_at: "2026-04-24T10:00:00.000Z",
    ...overrides,
  };
}

function makeItem(overrides: Partial<OrderItemRow> = {}): OrderItemRow {
  return {
    id: "00000000-0000-4000-8000-000000000211",
    order_id: "00000000-0000-4000-8000-000000000111",
    product_id: "00000000-0000-4000-8000-000000000311",
    variant_id: "00000000-0000-4000-8000-000000000411",
    title_snapshot: "Camiseta local 24/25",
    size_snapshot: "M",
    fulfillment_snapshot: "express",
    promised_min_days: 0,
    promised_max_days: 2,
    unit_price_snapshot: "1295",
    quantity: 2,
    customization_snapshot: null,
    ...overrides,
  };
}

describe("buildMercadoPagoPreferencePayload", () => {
  it("usa UYU y conserva referencias/urls del pedido", () => {
    const order = makeOrder();
    const items = [makeItem()];
    const appUrl = "https://store.example.com";

    const payload = buildMercadoPagoPreferencePayload({
      order,
      items,
      appUrl,
    }) as PreferencePayload;

    assert.equal(payload.items[0]?.currency_id, "UYU");
    assert.equal(payload.items[0]?.unit_price, 1295);
    assert.equal(payload.external_reference, `order:${order.id}`);
    assert.equal(
      payload.notification_url,
      "https://store.example.com/api/payments/mercadopago/webhook"
    );
    assert.equal(
      payload.back_urls.success,
      "https://store.example.com/checkout/success?publicReference=abcd1234"
    );
    assert.equal(
      payload.back_urls.pending,
      "https://store.example.com/checkout/pending?publicReference=abcd1234"
    );
    assert.equal(
      payload.back_urls.failure,
      "https://store.example.com/checkout/failure?publicReference=abcd1234"
    );
    assert.deepEqual(payload.payer, { email: "juan@test.com" });
  });
});
