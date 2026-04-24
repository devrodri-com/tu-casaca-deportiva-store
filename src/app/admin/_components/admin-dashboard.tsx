import Link from "next/link";

export function AdminDashboard() {
  return (
    <main className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-5 py-8 md:px-6">
      <header className="border-b border-border pb-5">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          Panel operativo
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-foreground">Inicio</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Accesos directos al catálogo y al seguimiento de pedidos. Todo el flujo de pago y webhooks
          sigue igual; acá solo administrás contenido y estado operativo.
        </p>
      </header>

      <section aria-labelledby="admin-quick-links">
        <h2 id="admin-quick-links" className="sr-only">
          Accesos rápidos
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <Link
            href="/admin/products"
            className="tcds-card group flex flex-col gap-2 p-4 transition-shadow hover:shadow-md"
          >
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-base font-semibold text-foreground">Productos</h3>
              <span className="text-xs font-medium text-sky-600 group-hover:underline">Abrir</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Alta, edición, variantes, imágenes y activación en la tienda pública.
            </p>
          </Link>
          <Link
            href="/admin/orders"
            className="tcds-card group flex flex-col gap-2 p-4 transition-shadow hover:shadow-md"
          >
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-base font-semibold text-foreground">Pedidos</h3>
              <span className="text-xs font-medium text-sky-600 group-hover:underline">Abrir</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Referencia pública, ítems, modalidad express/encargo y estado operativo.
            </p>
          </Link>
        </div>
      </section>

      <section className="tcds-card p-4 md:p-5" aria-labelledby="admin-areas-heading">
        <h2 id="admin-areas-heading" className="text-sm font-semibold text-foreground">
          Áreas de trabajo
        </h2>
        <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
          <li className="flex gap-2">
            <span className="font-medium text-foreground">Catálogo</span>
            <span>- tipos, público, personalización y precios base por variante.</span>
          </li>
          <li className="flex gap-2">
            <span className="font-medium text-foreground">Publicación</span>
            <span>- activar o desactivar productos visibles en el storefront.</span>
          </li>
          <li className="flex gap-2">
            <span className="font-medium text-foreground">Imágenes y variantes</span>
            <span>- desde la ficha de cada producto (no hay métricas globales acá).</span>
          </li>
          <li className="flex gap-2">
            <span className="font-medium text-foreground">Pedidos</span>
            <span>- seguimiento operativo; el detalle público sigue en su enlace.</span>
          </li>
        </ul>
      </section>
    </main>
  );
}
