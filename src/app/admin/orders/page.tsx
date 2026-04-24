import Link from "next/link";
import {
  listOrderStatusHistoryByOrderIds,
  listOrdersWithItems,
} from "@/modules/orders/infrastructure/order-store";
import {
  orderBelongsToCustomerGroup,
  parseAdminOrdersGrupoParam,
} from "@/modules/orders/application/get-admin-customers";
import { AdminOrderCard } from "./_components/admin-order-card";
import { AdminOrdersFilterBar } from "./_components/admin-orders-filter-bar";
import {
  buildAdminOrdersFilterCounts,
  orderMatchesAdminOrdersFilter,
  parseAdminOrdersFilter,
} from "./_lib/admin-order-helpers";

export const dynamic = "force-dynamic";

type AdminOrdersPageProps = {
  searchParams: Promise<{ filter?: string; grupo?: string }>;
};

export default async function AdminOrdersPage({
  searchParams,
}: AdminOrdersPageProps) {
  const params = await searchParams;
  const filter = parseAdminOrdersFilter(params.filter);
  const customerGrupo = parseAdminOrdersGrupoParam(params.grupo);

  const orders = await listOrdersWithItems();
  const historyByOrderId = await listOrderStatusHistoryByOrderIds(
    orders.map(({ order }) => order.id)
  );

  const orderRows = orders.map(({ order }) => order);
  const ordersForCounts = customerGrupo
    ? orderRows.filter((o) => orderBelongsToCustomerGroup(o, customerGrupo))
    : orderRows;
  const counts = buildAdminOrdersFilterCounts(ordersForCounts);

  const filtered = orders.filter(({ order }) => {
    if (
      customerGrupo &&
      !orderBelongsToCustomerGroup(order, customerGrupo)
    ) {
      return false;
    }
    return orderMatchesAdminOrdersFilter(order, filter);
  });

  const orderInGrupo = customerGrupo
    ? orders.find(({ order }) =>
        orderBelongsToCustomerGroup(order, customerGrupo)
      )
    : undefined;
  const customerBannerName =
    customerGrupo && orderInGrupo
      ? orderInGrupo.order.customer_full_name.trim()
      : null;

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-col gap-5 px-4 py-8 sm:px-5 md:px-6">
      <header className="border-b border-border pb-4">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          Operaciones
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-foreground">
          Pedidos
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Filtrá por pago y stock. Las alertas azules marcan pago o stock pendiente; en verde, stock ya
          descontado; en rojo, pago fallido. No operar pedidos sin pago confirmado.
        </p>
      </header>

      {orders.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-surface/50 px-5 py-10 text-center dark:border-white/10">
          <p className="text-base font-medium text-foreground">No hay pedidos cargados</p>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            Cuando se confirmen compras, aparecerán aquí con su referencia pública y estado de pago.
          </p>
        </div>
      ) : (
        <>
          {customerGrupo ? (
            <div
              className="rounded-lg border border-sky-200 bg-sky-50 px-3 py-2.5 text-sm text-sky-950 dark:border-sky-800/50 dark:bg-sky-950/35 dark:text-sky-100"
              role="status"
            >
              <p className="font-medium">
                Mostrando pedidos del cliente
                {customerBannerName ? ` · ${customerBannerName}` : ""}
              </p>
              <p className="mt-1 text-xs text-sky-900/90 dark:text-sky-200/90">
                Los filtros de pago se aplican solo a estos pedidos. Podés volver al listado completo.
              </p>
              <Link
                href="/admin/orders"
                className="mt-2 inline-flex text-xs font-semibold text-sky-800 underline-offset-2 hover:underline dark:text-sky-200"
              >
                Quitar filtro de cliente
              </Link>
            </div>
          ) : null}

          <AdminOrdersFilterBar
            active={filter}
            counts={counts}
            customerGrupo={customerGrupo ?? null}
          />

          {filtered.length === 0 ? (
            <div className="rounded-xl border border-border bg-surface/40 px-5 py-8 text-center dark:border-white/10">
              <p className="text-base font-medium text-foreground">
                Ningún pedido coincide con este filtro
              </p>
              <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
                Probá otro filtro o volvé a{" "}
                <Link
                  className="font-medium text-sky-700 underline-offset-2 hover:underline dark:text-sky-300"
                  href={
                    customerGrupo
                      ? `/admin/orders?${new URLSearchParams({ grupo: customerGrupo }).toString()}`
                      : "/admin/orders"
                  }
                >
                  Todos (en esta vista)
                </Link>
                .
              </p>
            </div>
          ) : (
            <ul className="flex flex-col gap-4">
              {filtered.map(({ order, items }) => (
                <li key={order.id}>
                  <AdminOrderCard
                    order={order}
                    items={items}
                    history={historyByOrderId.get(order.id) ?? []}
                  />
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </main>
  );
}
