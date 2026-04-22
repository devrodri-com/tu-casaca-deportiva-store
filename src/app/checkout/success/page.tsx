import Link from "next/link";
import { getOrderDetailByPublicReference } from "@/modules/orders/application/get-order-detail";

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
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-4 px-6 py-10">
      <h1 className="text-2xl font-semibold">Pago en proceso de confirmación</h1>
      <p className="text-sm text-foreground/80">
        Volviste desde Mercado Pago. Esta pantalla no confirma pago por sí sola.
      </p>
      <p className="text-sm">orderId: {order?.orderId ?? "N/A"}</p>
      <p className="text-sm">
        paymentStatus: {order?.paymentStatus ?? "N/A"}{" "}
        {order ? `(${order.paymentStatusLabel})` : ""}
      </p>
      {order ? (
        <Link className="text-sm underline" href={`/orders/${order.publicReference}`}>
          Ver detalle del pedido
        </Link>
      ) : null}
    </main>
  );
}
