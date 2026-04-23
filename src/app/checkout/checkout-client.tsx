"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import type { CartLine } from "@/modules/cart";
import { getCartLines, getCartTotal } from "@/modules/cart";
import { CheckoutDepartmentDropdown } from "./_components/checkout-department-dropdown";
import { CheckoutOrderLineItem } from "./_components/checkout-order-line-item";
import { CheckoutSummaryCard } from "./_components/checkout-summary-card";
import { CheckoutTrustPanel } from "./_components/checkout-trust-panel";

type CheckoutSuccess = {
  ok: true;
  orderId: string;
  publicReference: string;
};

type CheckoutError = {
  ok: false;
  message: string;
};

type PaymentPreferenceSuccess = {
  ok: true;
  redirectUrl: string;
};

const URUGUAY_DEPARTMENTS = [
  "Montevideo",
  "Canelones",
  "Maldonado",
  "Colonia",
  "San José",
  "Florida",
  "Lavalleja",
  "Rocha",
  "Treinta y Tres",
  "Cerro Largo",
  "Durazno",
  "Flores",
  "Soriano",
  "Río Negro",
  "Paysandú",
  "Salto",
  "Artigas",
  "Rivera",
  "Tacuarembó",
] as const;

function checkoutLineKey(line: CartLine): string {
  const customizationNumber = line.customization?.jerseyNumber ?? "none";
  const customizationName = line.customization?.jerseyName ?? "none";
  return `${line.productId}-${line.variantId}-${line.fulfillment}-${customizationNumber}-${customizationName}`;
}

export function CheckoutClient() {
  const [, forceRefresh] = useState(0);
  const isHydrated = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
  const lines = useMemo(() => (isHydrated ? getCartLines() : []), [isHydrated]);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [department, setDepartment] = useState("");
  const country = "Uruguay";
  const [submitting, setSubmitting] = useState(false);
  const [startingPayment, setStartingPayment] = useState(false);
  const [result, setResult] = useState<CheckoutSuccess | CheckoutError | null>(null);

  const total = useMemo(() => getCartTotal(lines), [lines]);
  const totalUnits = useMemo(
    () => lines.reduce((accumulator, line) => accumulator + line.quantity, 0),
    [lines]
  );
  const isFormValid =
    fullName.trim().length > 0 &&
    phone.trim().length > 0 &&
    address.trim().length > 0 &&
    city.trim().length > 0 &&
    department.trim().length > 0 &&
    country === "Uruguay";

  if (!isHydrated) {
    return (
      <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
        <div className="space-y-3">
          <div className="h-44 animate-pulse rounded-2xl border border-white/10 bg-neutral-900/70" />
          <div className="h-44 animate-pulse rounded-2xl border border-white/10 bg-neutral-900/70" />
        </div>
        <div className="h-52 animate-pulse rounded-2xl border border-white/10 bg-neutral-900/70" />
      </section>
    );
  }

  if (lines.length === 0) {
    return (
      <div className="mx-auto max-w-2xl rounded-2xl border border-dashed border-white/15 bg-neutral-900/60 px-6 py-12 text-center">
        <p className="text-lg font-semibold text-white">Tu carrito está vacío</p>
        <p className="mt-2 text-sm leading-relaxed text-neutral-400">
          Sumá productos desde la tienda para continuar con el pago.
        </p>
        <Link
          href="/products"
          className="mt-6 inline-flex min-h-10 items-center justify-center rounded-md bg-sky-500 px-5 text-sm font-semibold text-white transition hover:bg-sky-600"
        >
          Ir a la tienda
        </Link>
      </div>
    );
  }

  return (
    <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
      <div className="space-y-5">
        <section className="rounded-2xl border border-white/10 bg-neutral-900/90 p-4 shadow-lg shadow-black/25 ring-1 ring-white/5 md:p-5">
          <h2 className="text-base font-semibold text-white md:text-lg">Resumen de tu pedido</h2>
          <p className="mt-1 text-sm text-neutral-400">
            Verificá productos, modalidad de entrega y personalización antes de pasar al pago.
          </p>
          <ul className="mt-4 space-y-3">
            {lines.map((line) => (
              <CheckoutOrderLineItem key={checkoutLineKey(line)} line={line} />
            ))}
          </ul>
        </section>

        <section className="rounded-2xl border border-white/10 bg-neutral-900/90 p-4 shadow-lg shadow-black/25 ring-1 ring-white/5 md:p-5">
          <h2 className="text-base font-semibold text-white md:text-lg">Datos para confirmar la compra</h2>
          <p className="mt-1 text-sm text-neutral-400">
            Estos datos se usan para contactarte y coordinar la entrega en Uruguay.
          </p>

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <label className="flex flex-col gap-1 text-sm text-neutral-200">
              Nombre y apellido
              <input
                className="min-h-10 rounded-md border border-white/15 bg-neutral-950 px-3 text-sm text-white outline-none transition placeholder:text-neutral-500 focus:border-sky-400/70"
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                autoComplete="name"
                placeholder="Ej: Juan Pérez"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm text-neutral-200">
              Teléfono
              <input
                className="min-h-10 rounded-md border border-white/15 bg-neutral-950 px-3 text-sm text-white outline-none transition placeholder:text-neutral-500 focus:border-sky-400/70"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                autoComplete="tel"
                placeholder="Ej: 099 123 456"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm text-neutral-200 md:col-span-2">
              Dirección
              <input
                className="min-h-10 rounded-md border border-white/15 bg-neutral-950 px-3 text-sm text-white outline-none transition placeholder:text-neutral-500 focus:border-sky-400/70"
                value={address}
                onChange={(event) => setAddress(event.target.value)}
                autoComplete="street-address"
                placeholder="Ej: Av. 18 de Julio 1234 apto 5"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm text-neutral-200">
              Barrio o ciudad
              <input
                className="min-h-10 rounded-md border border-white/15 bg-neutral-950 px-3 text-sm text-white outline-none transition placeholder:text-neutral-500 focus:border-sky-400/70"
                value={city}
                onChange={(event) => setCity(event.target.value)}
                autoComplete="address-level2"
                placeholder="Ej: Cordón"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm text-neutral-200">
              Departamento
              <CheckoutDepartmentDropdown
                value={department}
                options={URUGUAY_DEPARTMENTS}
                onChange={setDepartment}
              />
            </label>
            <label className="flex flex-col gap-1 text-sm text-neutral-200">
              País
              <input
                className="min-h-10 rounded-md border border-white/10 bg-neutral-900 px-3 text-sm text-neutral-300"
                value={country}
                readOnly
                disabled
              />
            </label>
            <label className="flex flex-col gap-1 text-sm text-neutral-200">
              Email (opcional)
              <input
                className="min-h-10 rounded-md border border-white/15 bg-neutral-950 px-3 text-sm text-white outline-none transition placeholder:text-neutral-500 focus:border-sky-400/70"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
                placeholder="Ej: nombre@email.com"
              />
            </label>
          </div>

          <div className="mt-6">
            <CheckoutTrustPanel />
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              type="button"
              className="inline-flex min-h-11 items-center justify-center rounded-md bg-sky-500 px-5 text-sm font-semibold text-white transition hover:bg-sky-600 disabled:cursor-not-allowed disabled:bg-sky-500/40 disabled:text-white/80"
              disabled={submitting || !isFormValid}
              onClick={async () => {
                if (!isFormValid) {
                  return;
                }

                setSubmitting(true);
                setResult(null);

                try {
                  const response = await fetch("/api/checkout/confirm", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      lines,
                      customer: {
                        fullName,
                        phone,
                        email: email.trim() === "" ? null : email,
                        address,
                        city,
                        department,
                        country,
                      },
                    }),
                  });

                  const data = (await response.json()) as CheckoutSuccess | CheckoutError;
                  setResult(data);
                  forceRefresh((prev) => prev + 1);
                } catch {
                  setResult({
                    ok: false,
                    message: "No pudimos confirmar el pedido. Intentá nuevamente en unos segundos.",
                  });
                } finally {
                  setSubmitting(false);
                }
              }}
            >
              {submitting ? "Confirmando pedido..." : "Confirmar pedido"}
            </button>
            <p className="text-xs text-neutral-500">
              Al confirmar, se guarda tu pedido con los datos de entrega y se habilita el pago.
            </p>
          </div>

          {result?.ok ? (
            <div className="mt-4 rounded-xl border border-emerald-700/40 bg-emerald-950/30 px-3 py-2.5 text-sm text-emerald-200">
              Pedido confirmado. Referencia: <span className="font-semibold">{result.publicReference}</span>
            </div>
          ) : null}
          {result && !result.ok ? (
            <div className="mt-4 rounded-xl border border-red-800/50 bg-red-950/30 px-3 py-2.5 text-sm text-red-200">
              {result.message}
            </div>
          ) : null}
        </section>
      </div>

      <div className="space-y-4 lg:sticky lg:top-24 lg:self-start">
        <CheckoutSummaryCard totalLines={lines.length} totalUnits={totalUnits} totalAmount={total} />

        <section className="rounded-2xl border border-white/10 bg-neutral-900/90 p-4 shadow-lg shadow-black/25 ring-1 ring-white/5">
          <p className="text-sm font-semibold text-white">Pago</p>
          <p className="mt-1 text-xs leading-relaxed text-neutral-400">
            Cuando confirmes el pedido, podés continuar al pago seguro en Mercado Pago.
          </p>
          <button
            type="button"
            className="mt-4 inline-flex min-h-11 w-full items-center justify-center rounded-md bg-sky-500 px-4 text-sm font-semibold text-white transition hover:bg-sky-600 disabled:cursor-not-allowed disabled:bg-sky-500/40 disabled:text-white/80"
            disabled={!result?.ok || startingPayment}
            onClick={async () => {
              if (!result?.ok) {
                return;
              }

              setStartingPayment(true);
              try {
                const response = await fetch("/api/payments/mercadopago/preference", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ orderId: result.orderId }),
                });
                const data = (await response.json()) as PaymentPreferenceSuccess | CheckoutError;

                if (!data.ok) {
                  setResult(data);
                  setStartingPayment(false);
                  return;
                }

                window.location.href = data.redirectUrl;
              } catch {
                setResult({
                  ok: false,
                  message: "No pudimos iniciar el pago. Intentá nuevamente.",
                });
                setStartingPayment(false);
              }
            }}
          >
            {startingPayment ? "Redirigiendo..." : "Ir a pagar con Mercado Pago"}
          </button>
        </section>
      </div>
    </section>
  );
}
