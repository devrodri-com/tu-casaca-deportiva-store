import type { CartLine } from "@/modules/cart";

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

export function CartLineItem({ line, onDecrease, onIncrease, onRemove }: CartLineItemProps) {
  const identity = lineIdentity(line);
  const unitPrice = line.finalUnitPrice;
  const subtotal = unitPrice * line.quantity;
  const fulfillmentClass =
    line.fulfillment === "express"
      ? "border-emerald-800/45 bg-emerald-950/45 text-emerald-300"
      : line.fulfillment === "made_to_order"
        ? "border-sky-800/40 bg-sky-950/40 text-sky-200"
        : "border-neutral-700 bg-neutral-800 text-neutral-400";

  return (
    <li className="rounded-2xl border border-white/10 bg-neutral-900/90 p-4 shadow-md shadow-black/25 ring-1 ring-white/5">
      <div className="flex gap-4">
        <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-linear-to-b from-neutral-900 to-neutral-800">
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
            <h3 className="line-clamp-2 text-sm font-semibold text-white md:text-base">{line.title}</h3>
            <span className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-medium ${fulfillmentClass}`}>
              {line.fulfillment === "express" ? "Express" : line.fulfillment === "made_to_order" ? "Encargo" : "Sin stock"}
            </span>
          </div>

          <p className="text-xs text-neutral-400">Talle: {line.size}</p>
          <p className="text-xs text-neutral-400">{fulfillmentLabel(line)}</p>
          {line.customization ? (
            <p className="text-xs text-sky-300">
              Personalización: #{line.customization.jerseyNumber} · {line.customization.jerseyName}
            </p>
          ) : null}

          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <div className="inline-flex items-center rounded-md border border-white/15 bg-neutral-950">
              <button
                type="button"
                onClick={() => onDecrease(identity, line.quantity - 1)}
                disabled={line.quantity <= 1}
                className="inline-flex h-8 w-8 items-center justify-center text-sm text-neutral-300 transition hover:text-white disabled:cursor-not-allowed disabled:text-neutral-600"
                aria-label="Restar cantidad"
              >
                -
              </button>
              <span className="inline-flex h-8 min-w-9 items-center justify-center border-x border-white/10 px-2 text-sm font-semibold text-white">
                {line.quantity}
              </span>
              <button
                type="button"
                onClick={() => onIncrease(identity, line.quantity + 1)}
                className="inline-flex h-8 w-8 items-center justify-center text-sm text-neutral-300 transition hover:text-white"
                aria-label="Sumar cantidad"
              >
                +
              </button>
            </div>

            <div className="text-right">
              <p className="text-xs text-neutral-500">Unitario ${unitPrice}</p>
              <p className="text-sm font-semibold text-white">Subtotal ${subtotal}</p>
            </div>

            <button
              type="button"
              onClick={() => onRemove(identity)}
              className="inline-flex min-h-8 items-center justify-center rounded-md border border-white/15 px-2.5 text-xs font-medium text-neutral-300 transition hover:border-red-400/50 hover:text-red-200"
            >
              Eliminar
            </button>
          </div>
        </div>
      </div>
    </li>
  );
}
