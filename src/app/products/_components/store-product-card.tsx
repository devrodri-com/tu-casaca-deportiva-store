import Link from "next/link";
import type { CatalogProductListItem } from "@/modules/catalog/application/get-catalog-product-list";

type StoreProductCardProps = {
  product: CatalogProductListItem;
};

function deliveryBadgeClassName(label: CatalogProductListItem["deliveryBadgeLabel"]): string {
  switch (label) {
    case "Entrega rapida":
      return "border border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-800/50 dark:bg-emerald-950/50 dark:text-emerald-300";
    case "Por encargo":
      return "border border-sky-300 bg-sky-50 text-sky-900 dark:border-sky-800/40 dark:bg-sky-950/40 dark:text-sky-200";
    default:
      return "border border-zinc-300 bg-zinc-100 text-zinc-700 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-400";
  }
}

export function StoreProductCard({ product }: StoreProductCardProps) {
  const priceLabel = product.displayPrice !== null ? `Desde $${product.displayPrice}` : null;

  return (
    <Link
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-lg shadow-zinc-300/30 ring-1 ring-zinc-200/80 transition hover:-translate-y-0.5 hover:border-sky-400/50 hover:shadow-sky-500/15 dark:border-white/10 dark:bg-neutral-900/90 dark:shadow-black/30 dark:ring-white/5 dark:hover:border-sky-500/45 dark:hover:shadow-sky-900/25"
      href={`/products/${product.slug}`}
    >
      <div className="relative aspect-[15/9] overflow-hidden bg-linear-to-b from-white to-zinc-100 dark:from-neutral-900 dark:to-neutral-800">
        {product.primaryImageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- catálogo remoto Supabase; sin optimizador en esta etapa
          <img
            src={product.primaryImageUrl}
            alt={product.primaryImageAlt ?? product.title}
            className="h-full w-full object-contain p-2.5 transition duration-300 group-hover:scale-[1.02]"
            width={640}
            height={400}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-zinc-500 dark:text-neutral-500">
            Sin imagen
          </div>
        )}
      </div>
      <div className="flex min-h-34 flex-1 flex-col gap-1.5 p-4">
        <h2 className="line-clamp-2 text-base font-semibold leading-snug text-zinc-900 transition group-hover:text-sky-700 dark:text-white dark:group-hover:text-sky-100">
          {product.title}
        </h2>
        {priceLabel ? (
          <p className="text-sm font-semibold tracking-tight text-sky-700 dark:text-sky-200">{priceLabel}</p>
        ) : null}
        <p className="text-xs text-zinc-600 dark:text-neutral-400">{product.productTypeLabel}</p>
        <p className="text-xs text-zinc-500 dark:text-neutral-500">Para: {product.audienceLabel}</p>
        <div className="mt-auto flex items-center justify-between gap-3 pt-3">
          <span
            className={`inline-flex w-fit rounded px-2 py-0.5 text-[11px] font-medium ${deliveryBadgeClassName(
              product.deliveryBadgeLabel
            )}`}
          >
            {product.deliveryBadgeLabel}
          </span>
          <span className="inline-flex min-h-8 items-center justify-center rounded-md border border-sky-500/40 bg-sky-500/10 px-2.5 text-xs font-semibold text-sky-700 transition group-hover:border-sky-500/55 group-hover:bg-sky-500/15 group-hover:text-sky-800 dark:border-sky-500/35 dark:text-sky-300 dark:group-hover:border-sky-400/45 dark:group-hover:bg-sky-500/15 dark:group-hover:text-sky-200">
            Ver producto
          </span>
        </div>
      </div>
    </Link>
  );
}
