import { CartClient } from "./cart-client";
import { StorePublicFooter } from "@/components/storefront/store-public-footer";
import { StorePublicHeader } from "@/components/storefront/store-public-header";

export default function CartPage() {
  return (
    <div className="flex min-h-dvh flex-col bg-neutral-950 text-neutral-100">
      <StorePublicHeader variant="dark" />
      <main className="mx-auto w-full max-w-7xl flex-1 px-5 py-9 md:px-6 md:py-12">
        <section className="mx-auto max-w-4xl text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-sky-400/90">
            Carrito
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white md:text-4xl">
            Revisá tu pedido antes de pagar
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-neutral-400 md:text-base">
            Confirmá talles, cantidades, modalidad de entrega y personalización. Podés editar todo
            antes de pasar al pago.
          </p>
        </section>

        <div className="mt-7">
          <CartClient />
        </div>
      </main>
      <StorePublicFooter variant="dark" />
    </div>
  );
}
