import Link from "next/link";
import { listOrdersWithItems } from "@/modules/orders/infrastructure/order-store";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  const orders = await listOrdersWithItems();

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-col gap-4 px-6 py-10">
      <h1 className="text-2xl font-semibold">Admin · Pedidos</h1>
      {orders.length === 0 ? (
        <p className="text-sm text-foreground/80">No hay pedidos.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {orders.map(({ order, items }) => (
            <li key={order.id} className="rounded border p-3 text-sm">
              <p>orderId: {order.id}</p>
              <p>publicReference: {order.public_reference}</p>
              <p>paymentStatus: {order.payment_status}</p>
              <p>
                stockDiscountedAt: {order.stock_discounted_at ?? "no descontado"}
              </p>
              <Link
                className="underline"
                href={`/orders/${order.public_reference}`}
              >
                Ver detalle
              </Link>
              <ul className="mt-2 flex flex-col gap-1">
                {items.map((item) => (
                  <li key={item.id}>
                    {item.title_snapshot} · qty {item.quantity} ·{" "}
                    {item.fulfillment_snapshot}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
