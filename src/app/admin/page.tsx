import Link from "next/link";

export default function AdminPage() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-4 px-6 py-10">
      <h1 className="text-2xl font-semibold">Admin</h1>
      <Link className="text-sm underline" href="/admin/products">
        Productos
      </Link>
      <Link className="text-sm underline" href="/admin/orders">
        Pedidos
      </Link>
    </main>
  );
}
