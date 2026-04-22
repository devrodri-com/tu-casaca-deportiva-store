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

function getCheckoutDeliveryLabel(line: CartLine): string {
  if (line.fulfillment === "unavailable") {
    return "Sin disponibilidad";
  }
  if (line.promisedDays.minDays === 0 && line.promisedDays.maxDays === 2) {
    return "Entrega en 24-48h";
  }
  return "Entrega en 14-21 dias";
}

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
    return <p className="text-sm text-foreground/80">Carrito vacío.</p>;
  }

  return (
    <section className="flex flex-col gap-4">
      <p className="rounded border bg-foreground/[0.03] p-3 text-sm text-foreground/80">
        El pago confirma tu pedido. Los productos por encargo y personalizados
        pueden demorar mas.
      </p>
      <ul className="flex flex-col gap-2">
        {lines.map((line, index) => (
          <li
            key={`${line.productId}-${line.variantId}-${line.customization?.isCustomized ?? false}-${index}`}
            className="rounded border p-3 text-sm"
          >
            <p>Producto: {line.title}</p>
            <p>Talle: {line.size}</p>
            <p>Cantidad: {line.quantity}</p>
            <p>
              Personalizacion:{" "}
              {line.customization ? "Personalizacion incluida" : "No"}
            </p>
            <p>Modalidad: {line.fulfillment === "express" ? "Entrega rapida" : line.fulfillment === "made_to_order" ? "Por encargo" : "Sin disponibilidad"}</p>
            <p>
              Tiempo estimado: {getCheckoutDeliveryLabel(line)}
            </p>
            <p>Precio: ${line.finalUnitPrice}</p>
          </li>
        ))}
      </ul>

      <p className="text-sm font-medium">total: {total}</p>

      <label className="flex flex-col gap-1 text-sm">
        fullName
        <input
          className="rounded border px-3 py-2"
          value={fullName}
          onChange={(event) => setFullName(event.target.value)}
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        phone
        <input
          className="rounded border px-3 py-2"
          value={phone}
          onChange={(event) => setPhone(event.target.value)}
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        email (opcional)
        <input
          className="rounded border px-3 py-2"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
      </label>

      <button
        type="button"
        className="w-fit rounded border px-3 py-1 text-sm"
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
          className="w-fit rounded border px-3 py-1 text-sm"
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
        <p className="text-sm">Pedido confirmado. orderId: {result.orderId}</p>
      ) : null}
      {result && !result.ok ? (
        <p className="text-sm text-red-600">{result.message}</p>
      ) : null}
    </section>
  );
}
