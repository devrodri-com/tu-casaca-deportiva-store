import Link from "next/link";
import { notFound } from "next/navigation";
import { getOrderDetailByPublicReference } from "@/modules/orders/application/get-order-detail";

type OrderDetailPageProps = {
  params: Promise<{ publicReference: string }>;
};

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  const { publicReference } = await params;
  const order = await getOrderDetailByPublicReference(publicReference);

  if (!order) {
    notFound();
  }

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-4 px-6 py-10">
      <h1 className="text-2xl font-semibold">Pedido</h1>
      <p className="text-sm">orderId: {order.orderId}</p>
      <p className="text-sm">publicReference: {order.publicReference}</p>
      <p className="text-sm">
        paymentStatus: {order.paymentStatus} ({order.paymentStatusLabel})
      </p>
      <p className="text-sm font-medium">total: {order.total}</p>

      <ul className="flex flex-col gap-2">
        {order.items.map((item, index) => (
          <li key={`${item.title}-${index}`} className="rounded border p-3 text-sm">
            <p>title: {item.title}</p>
            <p>quantity: {item.quantity}</p>
            <p>customization: {item.customization}</p>
            <p>fulfillment: {item.fulfillment}</p>
            <p>
              promisedDays: {String(item.promisedDays.minDays)} /{" "}
              {String(item.promisedDays.maxDays)}
            </p>
            <p>unitPrice: {item.unitPrice}</p>
            <p>lineTotal: {item.lineTotal}</p>
          </li>
        ))}
      </ul>

      <Link className="text-sm underline" href="/checkout">
        Volver a checkout
      </Link>
    </main>
  );
}
