"use client";

import { useMemo, useState } from "react";
import type { CartLine } from "@/modules/cart";
import { getCartLines, getCartTotal } from "@/modules/cart";

type CheckoutSuccess = {
  ok: true;
  orderId: string;
};

type CheckoutError = {
  ok: false;
  message: string;
};

export function CheckoutClient() {
  const [lines] = useState<CartLine[]>(() => getCartLines());
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [startingPayment, setStartingPayment] = useState(false);
  const [result, setResult] = useState<CheckoutSuccess | CheckoutError | null>(null);

  const total = useMemo(() => getCartTotal(lines), [lines]);

  if (lines.length === 0) {
    return <p className="tcds-prose">Carrito vacío.</p>;
  }

  return (
    <section className="flex flex-col gap-4">
      <ul className="flex flex-col gap-2">
        {lines.map((line, index) => (
          <li
            key={`${line.productId}-${line.variantId}-${line.customization?.isCustomized ?? false}-${index}`}
            className="tcds-card p-3 text-sm"
          >
            <p>title: {line.title}</p>
            <p>size: {line.size}</p>
            <p>quantity: {line.quantity}</p>
            <p>fulfillment: {line.fulfillment}</p>
            <p>
              promisedDays: {String(line.promisedDays.minDays)} /{" "}
              {String(line.promisedDays.maxDays)}
            </p>
            <p>finalUnitPrice: {line.finalUnitPrice}</p>
          </li>
        ))}
      </ul>

      <p className="text-sm font-medium text-foreground">total: {total}</p>

      <label className="flex flex-col gap-1 text-sm text-foreground">
        fullName
        <input
          className="tcds-input"
          value={fullName}
          onChange={(event) => setFullName(event.target.value)}
        />
      </label>
      <label className="flex flex-col gap-1 text-sm text-foreground">
        phone
        <input
          className="tcds-input"
          value={phone}
          onChange={(event) => setPhone(event.target.value)}
        />
      </label>
      <label className="flex flex-col gap-1 text-sm text-foreground">
        email (opcional)
        <input
          className="tcds-input"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
      </label>

      <button
        type="button"
        className="tcds-btn-primary w-fit"
        disabled={submitting}
        onClick={async () => {
          setSubmitting(true);
          setResult(null);

          const response = await fetch("/api/checkout/confirm", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              lines,
              customer: {
                fullName,
                phone,
                email: email.trim() === "" ? null : email,
              },
            }),
          });

          const data = (await response.json()) as
            | CheckoutSuccess
            | CheckoutError;

          setResult(data);
          setSubmitting(false);
        }}
      >
        Confirmar pedido
      </button>

      {result?.ok ? (
        <button
          type="button"
          className="tcds-btn-primary w-fit"
          disabled={startingPayment}
          onClick={async () => {
            setStartingPayment(true);
            const response = await fetch(
              "/api/payments/mercadopago/preference",
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ orderId: result.orderId }),
              }
            );
            const data = (await response.json()) as
              | { ok: true; redirectUrl: string }
              | CheckoutError;

            if (!data.ok) {
              setResult(data);
              setStartingPayment(false);
              return;
            }

            window.location.href = data.redirectUrl;
          }}
        >
          Ir a pagar con Mercado Pago
        </button>
      ) : null}

      {result?.ok ? (
        <p className="tcds-prose">Pedido confirmado. orderId: {result.orderId}</p>
      ) : null}
      {result && !result.ok ? (
        <p className="text-sm font-medium text-red-600">{result.message}</p>
      ) : null}
    </section>
  );
}
