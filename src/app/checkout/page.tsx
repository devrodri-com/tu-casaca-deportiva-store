import { CheckoutClient } from "./checkout-client";
import { StorePublicFooter } from "@/components/storefront/store-public-footer";
import { StorePublicHeader } from "@/components/storefront/store-public-header";

export default function CheckoutPage() {
  return (
    <div className="storefront-shell">
      <StorePublicHeader />
      <main className="mx-auto w-full max-w-7xl flex-1 px-5 py-9 md:px-6 md:py-12">
        <section className="mx-auto max-w-4xl text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-sky-400/90">
            Pago
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-900 md:text-4xl dark:text-white">
            Finalizá tu compra con seguridad
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-zinc-600 md:text-base dark:text-neutral-400">
            Revisá tu pedido, completá tus datos y continuá al pago seguro en Mercado Pago.
          </p>
        </section>
        <div className="mt-7">
          <CheckoutClient />
        </div>
      </main>
      <StorePublicFooter />
    </div>
  );
}
