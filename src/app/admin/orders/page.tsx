import Link from "next/link";
import {
  listOrderStatusHistoryByOrderIds,
  listOrdersWithItems,
} from "@/modules/orders/infrastructure/order-store";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  const orders = await listOrdersWithItems();
  const historyByOrderId = await listOrderStatusHistoryByOrderIds(
    orders.map(({ order }) => order.id)
  );

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-col gap-4 px-6 py-10">
      <h1 className="tcds-title-page">Admin · Pedidos</h1>
      {orders.length === 0 ? (
        <p className="tcds-prose">No hay pedidos.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {orders.map(({ order, items }) => (
            <li key={order.id} className="tcds-card p-3 text-sm text-foreground">
              <p>orderId: {order.id}</p>
              <p>publicReference: {order.public_reference}</p>
              <p>paymentStatus: {order.payment_status}</p>
              <p>operationalStatus: {order.operational_status ?? "sin estado"}</p>
              <p>
                stockDiscountedAt: {order.stock_discounted_at ?? "no descontado"}
              </p>
              <form
                action="/api/admin/orders/status"
                method="post"
                className="mt-2 flex items-center gap-2"
              >
                <input type="hidden" name="orderId" value={order.id} />
                <select
                  name="nextOperationalStatus"
                  defaultValue={order.operational_status ?? ""}
                  className="tcds-input w-auto min-w-40"
                >
                  <option value="" disabled>
                    Seleccionar estado
                  </option>
                  <option value="paid">paid</option>
                  <option value="preparing">preparing</option>
                  <option value="ready">ready</option>
                  <option value="shipped">shipped</option>
                  <option value="delivered">delivered</option>
                  <option value="cancelled">cancelled</option>
                </select>
                <button type="submit" className="tcds-btn-secondary">
                  Guardar estado
                </button>
              </form>
              <Link
                className="tcds-link"
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
              <div className="mt-2">
                <p className="font-medium">Historial operativo:</p>
                <ul className="flex flex-col gap-1">
                  {(historyByOrderId.get(order.id) ?? []).map((event) => (
                    <li key={event.id}>
                      {event.previous_status ?? "null"} -&gt; {event.new_status} ·{" "}
                      {event.changed_at}
                    </li>
                  ))}
                  {(historyByOrderId.get(order.id) ?? []).length === 0 ? (
                    <li>Sin historial</li>
                  ) : null}
                </ul>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
