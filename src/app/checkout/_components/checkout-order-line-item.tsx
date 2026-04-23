import Link from "next/link";
import type { CartLine } from "@/modules/cart";

type CheckoutOrderLineItemProps = {
  line: CartLine;
};

function fulfillmentLabel(line: CartLine): string {
  if (line.fulfillment === "express") {
    return "Express · Retiro hoy / envío 24-48 h";
  }
  if (line.fulfillment === "made_to_order") {
    const min = line.promisedDays.minDays;
    const max = line.promisedDays.maxDays;
    if (min !== null && max !== null) {
      return `Por encargo · ${min}-${max} días`;
    }
    return "Por encargo · 14-21 días";
  }
  return "Sin disponibilidad";
}

export function CheckoutOrderLineItem({ line }: CheckoutOrderLineItemProps) {
  const subtotal = line.finalUnitPrice * line.quantity;
  const badgeClass =
    line.fulfillment === "express"
      ? "border-emerald-800/45 bg-emerald-950/45 text-emerald-300"
      : line.fulfillment === "made_to_order"
        ? "border-sky-800/40 bg-sky-950/40 text-sky-200"
        : "border-neutral-700 bg-neutral-800 text-neutral-400";

  return (
    <li className="rounded-2xl border border-white/10 bg-neutral-900/90 p-4 shadow-md shadow-black/20 ring-1 ring-white/5">
      <div className="flex gap-4">
        <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-linear-to-b from-neutral-900 to-neutral-800">
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
              <h3 className="line-clamp-2 text-sm font-semibold text-white md:text-base">{line.title}</h3>
              <Link
                href={line.productSlug ? `/products/${line.productSlug}` : "/products"}
                className="mt-0.5 inline-flex text-xs text-neutral-400 transition hover:text-sky-300"
              >
                Ver producto
              </Link>
            </div>
            <span className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-medium ${badgeClass}`}>
              {line.fulfillment === "express"
                ? "Express"
                : line.fulfillment === "made_to_order"
                  ? "Encargo"
                  : "Sin stock"}
            </span>
          </div>

          <p className="text-xs text-neutral-400">Talle: {line.size}</p>
          <p className="text-xs text-neutral-400">{fulfillmentLabel(line)}</p>
          {line.customization ? (
            <p className="text-xs text-sky-300">
              Personalización: #{line.customization.jerseyNumber} · {line.customization.jerseyName}
            </p>
          ) : null}

          <div className="flex items-center justify-between pt-1 text-sm">
            <p className="text-neutral-400">
              {line.quantity} x ${line.finalUnitPrice}
            </p>
            <p className="font-semibold text-white">Subtotal ${subtotal}</p>
          </div>
        </div>
      </div>
    </li>
  );
}
