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
    <aside className="rounded-2xl border border-white/10 bg-neutral-900/90 p-4 shadow-lg shadow-black/30 ring-1 ring-white/5">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-neutral-300">Resumen de compra</h2>
      <div className="mt-4 space-y-2 text-sm text-neutral-300">
        <p className="flex items-center justify-between">
          <span>Productos</span>
          <span className="font-medium text-white">{totalLines}</span>
        </p>
        <p className="flex items-center justify-between">
          <span>Unidades</span>
          <span className="font-medium text-white">{totalUnits}</span>
        </p>
        <p className="flex items-center justify-between border-t border-white/10 pt-2">
          <span>Total</span>
          <span className="text-lg font-semibold text-white">${totalAmount}</span>
        </p>
      </div>
      <p className="mt-4 text-xs leading-relaxed text-neutral-500">
        Si tu pedido combina líneas express y por encargo, cada una mantiene su tiempo estimado de
        entrega.
      </p>
    </aside>
  );
}
