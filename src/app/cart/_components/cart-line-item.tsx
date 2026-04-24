import type { CartLine } from "@/modules/cart";
import {
  fulfillmentListCompactLine,
  fulfillmentShortLabel,
} from "@/modules/orders/application/fulfillment-presentation";

type CartLineIdentity = {
  productId: string;
  variantId: string;
  fulfillment: CartLine["fulfillment"];
  isCustomized: boolean;
  customizationNumber: string | null;
  customizationName: string | null;
};

type CartLineItemProps = {
  line: CartLine;
  onDecrease: (identity: CartLineIdentity, nextQuantity: number) => void;
  onIncrease: (identity: CartLineIdentity, nextQuantity: number) => void;
  onRemove: (identity: CartLineIdentity) => void;
};

function lineIdentity(line: CartLine): CartLineIdentity {
  return {
    productId: line.productId,
    variantId: line.variantId,
    fulfillment: line.fulfillment,
    isCustomized: line.customization?.isCustomized ?? false,
    customizationNumber: line.customization?.jerseyNumber ?? null,
    customizationName: line.customization?.jerseyName ?? null,
  };
}

export function CartLineItem({ line, onDecrease, onIncrease, onRemove }: CartLineItemProps) {
  const identity = lineIdentity(line);
  const unitPrice = line.finalUnitPrice;
  const subtotal = unitPrice * line.quantity;
  const fulfillmentClass =
    line.fulfillment === "express"
      ? "border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-800/45 dark:bg-emerald-950/45 dark:text-emerald-300"
      : line.fulfillment === "made_to_order"
        ? "border-sky-300 bg-sky-50 text-sky-900 dark:border-sky-800/40 dark:bg-sky-950/40 dark:text-sky-200"
        : "border-zinc-300 bg-zinc-100 text-zinc-700 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-400";

  return (
    <li className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-md shadow-zinc-200/40 ring-1 ring-zinc-100 dark:border-white/10 dark:bg-neutral-900/90 dark:shadow-black/25 dark:ring-white/5">
      <div className="flex gap-4">
        <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-zinc-200 bg-linear-to-b from-zinc-50 to-zinc-100 dark:border-white/10 dark:from-neutral-900 dark:to-neutral-800">
          {line.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- catálogo remoto Supabase
            <img
              src={line.imageUrl}
              alt={line.imageAlt ?? line.title}
              className="h-full w-full object-contain p-2"
              width={96}
              height={96}
            />
          ) : (
            <span className="text-[11px] text-neutral-500">Sin imagen</span>
          )}
        </div>

        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <h3 className="line-clamp-2 text-sm font-semibold text-zinc-900 md:text-base dark:text-white">{line.title}</h3>
            <span className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-medium ${fulfillmentClass}`}>
              {fulfillmentShortLabel(line.fulfillment)}
            </span>
          </div>

          <p className="text-xs text-zinc-600 dark:text-neutral-400">Talle: {line.size}</p>
          <p className="text-xs text-zinc-600 dark:text-neutral-400">
            {fulfillmentListCompactLine({
              fulfillment: line.fulfillment,
              minDays: line.promisedDays.minDays,
              maxDays: line.promisedDays.maxDays,
            })}
          </p>
          {line.customization ? (
            <p className="text-xs text-sky-700 dark:text-sky-300">
              Personalización: #{line.customization.jerseyNumber} · {line.customization.jerseyName}
            </p>
          ) : null}

          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <div className="inline-flex items-center rounded-md border border-zinc-300 bg-white dark:border-white/15 dark:bg-neutral-950">
              <button
                type="button"
                onClick={() => onDecrease(identity, line.quantity - 1)}
                disabled={line.quantity <= 1}
                className="inline-flex h-8 w-8 items-center justify-center text-sm text-zinc-600 transition hover:text-zinc-900 disabled:cursor-not-allowed disabled:text-zinc-300 dark:text-neutral-300 dark:hover:text-white dark:disabled:text-neutral-600"
                aria-label="Restar cantidad"
              >
                -
              </button>
              <span className="inline-flex h-8 min-w-9 items-center justify-center border-x border-zinc-200 px-2 text-sm font-semibold text-zinc-900 dark:border-white/10 dark:text-white">
                {line.quantity}
              </span>
              <button
                type="button"
                onClick={() => onIncrease(identity, line.quantity + 1)}
                className="inline-flex h-8 w-8 items-center justify-center text-sm text-zinc-600 transition hover:text-zinc-900 dark:text-neutral-300 dark:hover:text-white"
                aria-label="Sumar cantidad"
              >
                +
              </button>
            </div>

            <div className="text-right">
              <p className="text-xs text-zinc-500 dark:text-neutral-500">Unitario ${unitPrice}</p>
              <p className="text-sm font-semibold text-zinc-900 dark:text-white">Subtotal ${subtotal}</p>
            </div>

            <button
              type="button"
              onClick={() => onRemove(identity)}
              className="inline-flex min-h-8 items-center justify-center rounded-md border border-zinc-300 px-2.5 text-xs font-medium text-zinc-600 transition hover:border-red-400/60 hover:text-red-700 dark:border-white/15 dark:text-neutral-300 dark:hover:border-red-400/50 dark:hover:text-red-200"
            >
              Eliminar
            </button>
          </div>
        </div>
      </div>
    </li>
  );
}
