import Link from "next/link";

export default function AdminPage() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-6 py-10">
      <header className="flex flex-col gap-1 border-b border-border pb-6">
        <h1 className="tcds-title-page">Panel de administración</h1>
        <p className="text-sm text-muted-foreground">
          Gestioná el catálogo y los pedidos desde el menú lateral.
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2">
        <Link
          href="/admin/products"
          className="tcds-card flex flex-col gap-2 p-5 transition-shadow hover:shadow-md"
        >
          <h2 className="text-base font-semibold text-foreground">Productos</h2>
          <p className="text-sm text-muted-foreground">
            Alta, variantes, imágenes y publicación en tienda.
          </p>
          <span className="tcds-link mt-2 w-fit text-sm">Ir a productos</span>
        </Link>
        <Link
          href="/admin/orders"
          className="tcds-card flex flex-col gap-2 p-5 transition-shadow hover:shadow-md"
        >
          <h2 className="text-base font-semibold text-foreground">Pedidos</h2>
          <p className="text-sm text-muted-foreground">
            Seguimiento operativo de compras pagadas.
          </p>
          <span className="tcds-link mt-2 w-fit text-sm">Ir a pedidos</span>
        </Link>
      </section>
    </main>
  );
}
