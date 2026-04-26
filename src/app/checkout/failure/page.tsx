import Link from "next/link";
import { getOrderDetailByPublicReference } from "@/modules/orders/application/get-order-detail";
import { PostCheckoutCtaBlock } from "@/app/checkout/_components/post-checkout-cta-block";
import { CheckoutIdempotencyKeyClearer } from "@/app/checkout/_components/checkout-idempotency-key-clearer";
import { StorePublicFooter } from "@/components/storefront/store-public-footer";
import { StorePublicHeader } from "@/components/storefront/store-public-header";

type CheckoutFailurePageProps = {
  searchParams: Promise<{ publicReference?: string }>;
};

export default async function CheckoutFailurePage({
  searchParams,
}: CheckoutFailurePageProps) {
  const params = await searchParams;
  const order = params.publicReference
    ? await getOrderDetailByPublicReference(params.publicReference)
    : null;

  return (
    <div className="storefront-shell">
      <CheckoutIdempotencyKeyClearer />
      <StorePublicHeader />
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-4 px-6 py-10">
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-white">
          Pago no aprobado
        </h1>
        <p className="max-w-2xl text-sm leading-relaxed text-zinc-600 dark:text-neutral-300">
          {order ? (
            <>
              No se acreditó el pago. Podés intentar otra tarjeta o volver al carrito y
              reintentar el checkout. Si creés que se cobró, escribinos con la referencia pública
              o el nº de operación de Mercado Pago.
            </>
          ) : (
            <>
              El pago no se completó. Revisá fondos, datos de la tarjeta o probá con otro
              medio; tu carrito sigue en la tienda mientras tengan stock las variantes.
            </>
          )}
        </p>
        {order ? <PostCheckoutCtaBlock order={order} /> : null}
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
          <Link
            className="inline-flex w-fit min-h-10 items-center justify-center rounded-md border border-zinc-300 bg-white px-4 text-sm font-medium text-zinc-900 transition hover:bg-zinc-50 dark:border-white/15 dark:bg-neutral-900/50 dark:text-neutral-100 dark:hover:bg-neutral-800/80"
            href="/cart"
          >
            Volver al carrito
          </Link>
          <Link
            className="tcds-link text-sm"
            href="/products"
          >
            Seguir en la tienda
          </Link>
        </div>
      </main>
      <StorePublicFooter />
    </div>
  );
}
