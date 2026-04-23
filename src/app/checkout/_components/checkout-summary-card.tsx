type CheckoutSummaryCardProps = {
  totalLines: number;
  totalUnits: number;
  totalAmount: number;
};

export function CheckoutSummaryCard({
  totalLines,
  totalUnits,
  totalAmount,
}: CheckoutSummaryCardProps) {
  return (
    <aside className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-lg shadow-zinc-200/40 ring-1 ring-zinc-100 dark:border-white/10 dark:bg-neutral-900/90 dark:shadow-black/30 dark:ring-white/5">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-600 dark:text-neutral-300">
        Resumen de compra
      </h2>
      <div className="mt-4 space-y-2 text-sm text-zinc-600 dark:text-neutral-300">
        <p className="flex items-center justify-between">
          <span>Productos</span>
          <span className="font-medium text-zinc-900 dark:text-white">{totalLines}</span>
        </p>
        <p className="flex items-center justify-between">
          <span>Unidades</span>
          <span className="font-medium text-zinc-900 dark:text-white">{totalUnits}</span>
        </p>
        <p className="flex items-center justify-between border-t border-zinc-200 pt-2 dark:border-white/10">
          <span>Total</span>
          <span className="text-lg font-semibold text-zinc-900 dark:text-white">${totalAmount}</span>
        </p>
      </div>
      <p className="mt-4 text-xs leading-relaxed text-zinc-500 dark:text-neutral-500">
        Si tu pedido combina líneas express y por encargo, cada una mantiene su tiempo estimado de
        entrega.
      </p>
    </aside>
  );
}
