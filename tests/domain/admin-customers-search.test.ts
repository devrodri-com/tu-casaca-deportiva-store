import assert from "node:assert/strict";
import { test } from "node:test";
import type { Database } from "@/lib/supabase/database.types";
import { getAdminCustomers } from "@/modules/orders/application/get-admin-customers";

type OrderRow = Database["public"]["Tables"]["orders"]["Row"];

function makeOrderRow(params: {
  id: string;
  createdAt: string;
  paymentStatus: OrderRow["payment_status"];
  total: string;
  fullName: string;
  phone: string;
  email: string | null;
  address: string;
  city: string;
  department: string;
  country?: string;
  publicReference: string;
}): OrderRow {
  return {
    id: params.id,
    public_reference: params.publicReference,
    total: params.total,
    customer_full_name: params.fullName,
    customer_phone: params.phone,
    customer_email: params.email,
    customer_address: params.address,
    customer_city: params.city,
    customer_department: params.department,
    customer_country: params.country ?? "Uruguay",
    checkout_idempotency_key: null,
    payment_status: params.paymentStatus,
    mercado_pago_preference_id: null,
    mercado_pago_payment_id: null,
    mercado_pago_status: null,
    paid_at: params.paymentStatus === "paid" ? params.createdAt : null,
    stock_discounted_at: null,
    operational_status: null,
    operational_updated_at: null,
    created_at: params.createdAt,
  };
}

const ORDERS: OrderRow[] = [
  makeOrderRow({
    id: "o-1",
    createdAt: "2026-04-20T10:00:00.000Z",
    paymentStatus: "paid",
    total: "1000",
    fullName: "Juan Perez",
    phone: "099123456",
    email: "juan@gmail.com",
    address: "Belvedere 123",
    city: "Montevideo",
    department: "Montevideo",
    publicReference: "REFJUAN000000001",
  }),
  makeOrderRow({
    id: "o-2",
    createdAt: "2026-04-21T10:00:00.000Z",
    paymentStatus: "awaiting_payment",
    total: "500",
    fullName: "Juan Perez",
    phone: "099123456",
    email: "juan@gmail.com",
    address: "Belvedere 123",
    city: "Montevideo",
    department: "Montevideo",
    publicReference: "REFJUAN000000002",
  }),
  makeOrderRow({
    id: "o-3",
    createdAt: "2026-04-22T10:00:00.000Z",
    paymentStatus: "pending",
    total: "700",
    fullName: "Maria Lopez",
    phone: "098000111",
    email: null,
    address: "Centro 456",
    city: "Las Piedras",
    department: "Canelones",
    publicReference: "REFMARIA00000001",
  }),
];

test("q vacío devuelve todos los clientes", () => {
  const out = getAdminCustomers({ orders: ORDERS, q: "" });
  assert.equal(out.length, 2);
});

test("q con espacios devuelve todos los clientes", () => {
  const out = getAdminCustomers({ orders: ORDERS, q: "   " });
  assert.equal(out.length, 2);
});

test("busca por nombre case-insensitive", () => {
  const out = getAdminCustomers({ orders: ORDERS, q: "juan" });
  assert.equal(out.length, 1);
  assert.equal(out[0].displayName, "Juan Perez");
});

test("busca por teléfono", () => {
  const out = getAdminCustomers({ orders: ORDERS, q: "099" });
  assert.equal(out.length, 1);
  assert.equal(out[0].phoneDisplay, "099123456");
});

test("busca por email", () => {
  const out = getAdminCustomers({ orders: ORDERS, q: "GMAIL" });
  assert.equal(out.length, 1);
  assert.equal(out[0].emailTrimmed, "juan@gmail.com");
});

test("busca por última dirección conocida", () => {
  const out = getAdminCustomers({ orders: ORDERS, q: "belvedere" });
  assert.equal(out.length, 1);
  assert.match(out[0].lastKnownAddressLine.toLowerCase(), /belvedere/);
});
