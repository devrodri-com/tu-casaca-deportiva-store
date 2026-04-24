import Link from "next/link";

type CartSummaryProps = {
  total: number;
  totalUnits: number;
};

export function CartSummary({ total, totalUnits }: CartSummaryProps) {
  return (
    <aside className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-lg shadow-zinc-200/40 ring-1 ring-zinc-100 md:sticky md:top-24 dark:border-white/10 dark:bg-neutral-900/90 dark:shadow-black/30 dark:ring-white/5">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-600 dark:text-neutral-300">
        Resumen
      </h2>
      <div className="mt-4 space-y-2 text-sm text-zinc-600 dark:text-neutral-300">
        <p className="flex items-center justify-between">
          <span>Unidades</span>
          <span className="font-medium text-zinc-900 dark:text-white">{totalUnits}</span>
        </p>
        <p className="flex items-center justify-between">
          <span>Subtotal</span>
          <span className="text-lg font-semibold text-zinc-900 dark:text-white">${total}</span>
        </p>
      </div>
      <p className="mt-4 text-xs leading-relaxed text-zinc-500 dark:text-neutral-500">
        Un mismo pedido puede combinar líneas express y por encargo. Confirmás el detalle final antes
        de pagar.
      </p>
      <Link
        href="/checkout"
        className="mt-5 inline-flex min-h-11 w-full items-center justify-center rounded-md bg-sky-500 px-4 text-sm font-semibold text-white transition hover:bg-sky-600"
      >
        Ir a pagar
      </Link>
    </aside>
  );
}
