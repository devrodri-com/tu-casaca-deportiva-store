import Link from "next/link";

export default function AdminPage() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-4 px-6 py-10">
      <h1 className="tcds-title-page">Admin</h1>
      <nav className="tcds-card flex max-w-sm flex-col gap-2 p-4 text-sm">
        <Link className="tcds-link" href="/admin/products">
          Productos
        </Link>
        <Link className="tcds-link" href="/admin/orders">
          Pedidos
        </Link>
      </nav>
    </main>
  );
}
