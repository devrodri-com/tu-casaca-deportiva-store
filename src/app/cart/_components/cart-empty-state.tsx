import Link from "next/link";

export function CartEmptyState() {
  return (
    <div className="mx-auto max-w-2xl rounded-2xl border border-dashed border-white/15 bg-neutral-900/60 px-6 py-14 text-center">
      <p className="text-lg font-semibold text-white">Tu carrito está vacío</p>
      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-neutral-400">
        Agregá productos desde la tienda para revisar talles, modalidad de entrega y total antes de
        pagar.
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/products"
          className="inline-flex min-h-10 items-center justify-center rounded-md bg-sky-500 px-5 text-sm font-semibold text-white transition hover:bg-sky-600"
        >
          Ir a la tienda
        </Link>
        <Link
          href="/"
          className="inline-flex min-h-10 items-center justify-center rounded-md border border-white/15 px-5 text-sm font-semibold text-neutral-200 transition hover:border-sky-500/40 hover:text-sky-200"
        >
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}
