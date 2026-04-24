import { getOrderDetailByPublicReference } from "@/modules/orders/application/get-order-detail";
import { PostCheckoutCtaBlock } from "@/app/checkout/_components/post-checkout-cta-block";
import { StorePublicFooter } from "@/components/storefront/store-public-footer";
import { StorePublicHeader } from "@/components/storefront/store-public-header";

type CheckoutSuccessPageProps = {
  searchParams: Promise<{ publicReference?: string }>;
};

export default async function CheckoutSuccessPage({
  searchParams,
}: CheckoutSuccessPageProps) {
  const params = await searchParams;
  const order = params.publicReference
    ? await getOrderDetailByPublicReference(params.publicReference)
    : null;

  return (
    <div className="storefront-shell">
      <StorePublicHeader />
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-4 px-6 py-10">
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-white">
          Gracias por tu compra
        </h1>
        <p className="max-w-2xl text-sm leading-relaxed text-zinc-600 dark:text-neutral-300">
          {order ? (
            <>
              Tu pedido quedó con la referencia pública. Si venís de Mercado Pago, el acreditado
              puede demorar unos minutos: podés abrir &quot;Ver detalle del pedido&quot; para
              comprobar el estado.
            </>
          ) : (
            <>
              Te redirigimos con una referencia, pero aún no pegamos con el dato. Si hacés
              un pago, guardá en Mercado Pago o buscá el comprobante; si hace falta, escribinos
              con tu nombre o mail de compra.
            </>
          )}
        </p>
        {order ? <PostCheckoutCtaBlock order={order} /> : null}
      </main>
      <StorePublicFooter />
    </div>
  );
}
