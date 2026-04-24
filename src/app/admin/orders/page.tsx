import {
  listOrderStatusHistoryByOrderIds,
  listOrdersWithItems,
} from "@/modules/orders/infrastructure/order-store";
import { AdminOrderCard } from "./_components/admin-order-card";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  const orders = await listOrdersWithItems();
  const historyByOrderId = await listOrderStatusHistoryByOrderIds(
    orders.map(({ order }) => order.id)
  );

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-5 px-5 py-8 md:px-6">
      <header className="border-b border-border pb-4">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          Operaciones
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-foreground">Pedidos</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Referencia, cliente, pago, ítems con express o encargo, y cambio de estado operativo. Los
          valores enviados al servidor no cambian (mismos códigos en el formulario).
        </p>
      </header>

      {orders.length === 0 ? (
        <p className="tcds-prose">No hay pedidos cargados.</p>
      ) : (
        <ul className="flex flex-col gap-4">
          {orders.map(({ order, items }) => (
            <li key={order.id}>
              <AdminOrderCard order={order} items={items} history={historyByOrderId.get(order.id) ?? []} />
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
