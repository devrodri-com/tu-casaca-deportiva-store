import Link from "next/link";
import { getOrderDetailByPublicReference } from "@/modules/orders/application/get-order-detail";

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
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-4 px-6 py-10">
      <h1 className="tcds-title-page">Pago pendiente</h1>
      <p className="tcds-prose max-w-2xl">
        Mercado Pago informó estado pendiente. El webhook actualizará la orden.
      </p>
      <div className="tcds-card p-4 text-sm text-foreground">
        <p>orderId: {order?.orderId ?? "N/A"}</p>
        <p>
          paymentStatus: {order?.paymentStatus ?? "N/A"}{" "}
          {order ? `(${order.paymentStatusLabel})` : ""}
        </p>
      </div>
      {order ? (
        <Link className="tcds-link text-sm" href={`/orders/${order.publicReference}`}>
          Ver detalle del pedido
        </Link>
      ) : null}
    </main>
  );
}
