import Link from "next/link";
import type { CartLine } from "@/modules/cart";
import {
  fulfillmentListCompactLine,
  fulfillmentShortLabel,
} from "@/modules/orders/application/fulfillment-presentation";

type CheckoutOrderLineItemProps = {
  line: CartLine;
};

export function CheckoutOrderLineItem({ line }: CheckoutOrderLineItemProps) {
  const subtotal = line.finalUnitPrice * line.quantity;
  const badgeClass =
    line.fulfillment === "express"
      ? "border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-800/45 dark:bg-emerald-950/45 dark:text-emerald-300"
      : line.fulfillment === "made_to_order"
        ? "border-sky-300 bg-sky-50 text-sky-900 dark:border-sky-800/40 dark:bg-sky-950/40 dark:text-sky-200"
        : "border-zinc-300 bg-zinc-100 text-zinc-700 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-400";

  return (
    <li className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-md shadow-zinc-200/30 ring-1 ring-zinc-100 dark:border-white/10 dark:bg-neutral-900/90 dark:shadow-black/20 dark:ring-white/5">
      <div className="flex gap-4">
        <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-zinc-200 bg-linear-to-b from-zinc-50 to-zinc-100 dark:border-white/10 dark:from-neutral-900 dark:to-neutral-800">
          {line.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- catálogo remoto Supabase
            <img
              src={line.imageUrl}
              alt={line.imageAlt ?? line.title}
              className="h-full w-full object-contain p-2"
              width={80}
              height={80}
            />
          ) : (
            <span className="text-[11px] text-neutral-500">Sin imagen</span>
          )}
        </div>

        <div className="min-w-0 flex-1 space-y-1.5">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="line-clamp-2 text-sm font-semibold text-zinc-900 md:text-base dark:text-white">{line.title}</h3>
              <Link
                href={line.productSlug ? `/products/${line.productSlug}` : "/products"}
                className="mt-0.5 inline-flex text-xs text-zinc-500 transition hover:text-sky-700 dark:text-neutral-400 dark:hover:text-sky-300"
              >
                Ver producto
              </Link>
            </div>
            <span className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-medium ${badgeClass}`}>
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

          <div className="flex items-center justify-between pt-1 text-sm">
            <p className="text-zinc-500 dark:text-neutral-400">
              {line.quantity} x ${line.finalUnitPrice}
            </p>
            <p className="font-semibold text-zinc-900 dark:text-white">Subtotal ${subtotal}</p>
          </div>
        </div>
      </div>
    </li>
  );
}
