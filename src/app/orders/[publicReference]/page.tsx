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
      <h1 className="tcds-title-page">Pedido</h1>
      <div className="tcds-card p-4 text-sm text-foreground">
        <p>orderId: {order.orderId}</p>
        <p>publicReference: {order.publicReference}</p>
        <p>
          paymentStatus: {order.paymentStatus} ({order.paymentStatusLabel})
        </p>
        <p className="font-medium">total: {order.total}</p>
      </div>

      <ul className="flex flex-col gap-2">
        {order.items.map((item, index) => (
          <li key={`${item.title}-${index}`} className="tcds-card p-3 text-sm">
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

      <Link className="tcds-link text-sm" href="/checkout">
        Volver a checkout
      </Link>
    </main>
  );
}
