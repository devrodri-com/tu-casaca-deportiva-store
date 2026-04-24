import { getOrderDetailByPublicReference } from "@/modules/orders/application/get-order-detail";
import { PostCheckoutCtaBlock } from "@/app/checkout/_components/post-checkout-cta-block";
import { StorePublicFooter } from "@/components/storefront/store-public-footer";
import { StorePublicHeader } from "@/components/storefront/store-public-header";

type CheckoutPendingPageProps = {
  searchParams: Promise<{ publicReference?: string }>;
};

export default async function CheckoutPendingPage({
  searchParams,
}: CheckoutPendingPageProps) {
  const params = await searchParams;
  const order = params.publicReference
    ? await getOrderDetailByPublicReference(params.publicReference)
    : null;

  return (
    <div className="storefront-shell">
      <StorePublicHeader />
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-4 px-6 py-10">
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-white">
          Pago pendiente
        </h1>
        <p className="max-w-2xl text-sm leading-relaxed text-zinc-600 dark:text-neutral-300">
          {order ? (
            <>
              El medio de pago aún no liberó el débito. A veces toma pocos minutos; no hace falta
              volver a pagar. Podés rastrear el pedido con la referencia de abajo.
            </>
          ) : (
            <>
              Mercado Pago dejó el pago como pendiente. Revisá la app bancaria o el mail de
              resumen, y luego abrí de nuevo &quot;Ver detalle del pedido&quot; si tenés el
              enlace.
            </>
          )}
        </p>
        {order ? <PostCheckoutCtaBlock order={order} /> : null}
      </main>
      <StorePublicFooter />
    </div>
  );
}
