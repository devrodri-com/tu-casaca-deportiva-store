import Link from "next/link";
import { getOrderDetailByPublicReference } from "@/modules/orders/application/get-order-detail";
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
    <div className="flex min-h-dvh flex-col bg-neutral-950 text-neutral-100">
      <StorePublicHeader variant="dark" />
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-4 px-6 py-10">
        <h1 className="text-3xl font-semibold tracking-tight text-white">Pago en proceso de confirmación</h1>
        <p className="max-w-2xl text-sm leading-relaxed text-neutral-300">
          Recibimos tu regreso desde Mercado Pago. La acreditación final se confirma automáticamente.
        </p>
        <div className="rounded-2xl border border-white/10 bg-neutral-900/90 p-4 text-sm text-neutral-200 ring-1 ring-white/5">
          <p>Pedido: {order?.orderId ?? "No disponible"}</p>
          <p>
            Estado del pago: {order?.paymentStatus ?? "No disponible"}{" "}
            {order ? `(${order.paymentStatusLabel})` : ""}
          </p>
        </div>
        {order ? (
          <Link
            className="inline-flex w-fit min-h-10 items-center justify-center rounded-md bg-sky-500 px-4 text-sm font-semibold text-white transition hover:bg-sky-600"
            href={`/orders/${order.publicReference}`}
          >
            Ver detalle del pedido
          </Link>
        ) : null}
      </main>
      <StorePublicFooter variant="dark" />
    </div>
  );
}
