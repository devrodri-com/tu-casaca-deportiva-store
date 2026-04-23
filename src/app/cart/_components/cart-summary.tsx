import Link from "next/link";

type CartSummaryProps = {
  total: number;
  totalUnits: number;
};

export function CartSummary({ total, totalUnits }: CartSummaryProps) {
  return (
    <aside className="rounded-2xl border border-white/10 bg-neutral-900/90 p-4 shadow-lg shadow-black/30 ring-1 ring-white/5 md:sticky md:top-24">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-neutral-300">Resumen</h2>
      <div className="mt-4 space-y-2 text-sm text-neutral-300">
        <p className="flex items-center justify-between">
          <span>Unidades</span>
          <span className="font-medium text-white">{totalUnits}</span>
        </p>
        <p className="flex items-center justify-between">
          <span>Subtotal</span>
          <span className="text-lg font-semibold text-white">${total}</span>
        </p>
      </div>
      <p className="mt-4 text-xs leading-relaxed text-neutral-500">
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
