import Link from "next/link";
import { AdminCustomerCard } from "./_components/admin-customer-card";
import { listOrderRowsOnly } from "@/modules/orders/infrastructure/order-store";
import { getAdminCustomers } from "@/modules/orders/application/get-admin-customers";

export const dynamic = "force-dynamic";

type AdminCustomersPageProps = {
  searchParams: Promise<{ q?: string }>;
};

export default async function AdminCustomersPage({
  searchParams,
}: AdminCustomersPageProps) {
  const params = await searchParams;
  const qRaw = params.q ?? "";
  const q = qRaw.trim();
  const orderRows = await listOrderRowsOnly();
  const customers = getAdminCustomers({ orders: orderRows, q });
  const hasSearch = q.length > 0;

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-col gap-5 px-4 py-8 sm:px-5 md:px-6">
      <header className="border-b border-border pb-4">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          Operaciones
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-foreground">
          Clientes
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Clientes derivados de pedidos existentes (sin tabla propia). Se agrupan por teléfono, o por
          email si no hay teléfono, o por nombre y dirección como respaldo. Los totales pagados suman
          solo pedidos con pago confirmado.
        </p>
      </header>

      <section className="rounded-lg border border-border bg-surface/30 p-3 dark:border-white/10">
        <form
          action="/admin/customers"
          method="get"
          className="flex flex-col gap-2 sm:flex-row sm:items-center"
        >
          <input
            type="text"
            name="q"
            defaultValue={q}
            placeholder="Buscar por nombre, teléfono, email o dirección"
            className="tcds-input min-h-10 w-full"
            aria-label="Buscar clientes"
          />
          <button type="submit" className="tcds-btn-secondary w-fit shrink-0">
            Buscar
          </button>
          {hasSearch ? (
            <Link className="tcds-link text-sm" href="/admin/customers">
              Limpiar
            </Link>
          ) : null}
        </form>
        {hasSearch ? (
          <p className="mt-2 text-xs text-muted-foreground">
            Resultados para “{q}”
          </p>
        ) : null}
      </section>

      {orderRows.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-surface/50 px-5 py-10 text-center dark:border-white/10">
          <p className="text-base font-medium text-foreground">Todavía no hay clientes para mostrar</p>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            Aparecerán cuando exista al menos un pedido. Cada cliente refleja los datos snapshot del
            último pedido en la dirección y el contacto.
          </p>
        </div>
      ) : customers.length === 0 ? (
        <div className="rounded-xl border border-border bg-surface/40 px-5 py-10 text-center dark:border-white/10">
          <p className="text-base font-medium text-foreground">
            No encontramos clientes para esa búsqueda.
          </p>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            Probá con otro término o volvé al listado completo.
          </p>
          <Link
            className="mt-3 inline-flex text-sm font-medium text-sky-700 underline-offset-2 hover:underline dark:text-sky-300"
            href="/admin/customers"
          >
            Ver todos
          </Link>
        </div>
      ) : (
        <ul className="flex flex-col gap-4">
          {customers.map((customer) => (
            <li key={customer.groupKey}>
              <AdminCustomerCard customer={customer} />
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
