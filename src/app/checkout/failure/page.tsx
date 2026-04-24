import Link from "next/link";
import { getOrderDetailByPublicReference } from "@/modules/orders/application/get-order-detail";
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
      <StorePublicHeader />
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-4 px-6 py-10">
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-white">
          Pago no completado
        </h1>
        <p className="max-w-2xl text-sm leading-relaxed text-zinc-600 dark:text-neutral-300">
          El pago no se completó. Podés reintentar desde la pantalla de pago cuando quieras.
        </p>
        <div className="rounded-2xl border border-zinc-200 bg-white p-4 text-sm text-zinc-800 ring-1 ring-zinc-200/80 dark:border-white/10 dark:bg-neutral-900/90 dark:text-neutral-200 dark:ring-white/5">
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
      <StorePublicFooter />
    </div>
  );
}
