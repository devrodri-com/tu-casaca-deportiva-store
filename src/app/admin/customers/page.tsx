import { AdminCustomerCard } from "./_components/admin-customer-card";
import { listOrderRowsOnly } from "@/modules/orders/infrastructure/order-store";
import { buildAdminCustomerSummaries } from "@/modules/orders/application/get-admin-customers";

export const dynamic = "force-dynamic";

export default async function AdminCustomersPage() {
  const orderRows = await listOrderRowsOnly();
  const customers = buildAdminCustomerSummaries(orderRows);

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

      {customers.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-surface/50 px-5 py-10 text-center dark:border-white/10">
          <p className="text-base font-medium text-foreground">Todavía no hay clientes para mostrar</p>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            Aparecerán cuando exista al menos un pedido. Cada cliente refleja los datos snapshot del
            último pedido en la dirección y el contacto.
          </p>
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
