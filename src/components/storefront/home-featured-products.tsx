import Link from "next/link";
import {
  catalogListDeliveryBadgeClassName,
  catalogListDeliveryBadgeLabel,
} from "@/app/products/_lib/catalog-list-delivery-badge";
import type { CatalogProductListItem } from "@/modules/catalog/application/get-catalog-product-list";

type HomeFeaturedProductsProps = {
  items: CatalogProductListItem[];
};

export function HomeFeaturedProducts({ items }: HomeFeaturedProductsProps) {
  const featuredGridClass =
    items.length <= 2
      ? "mx-auto mt-10 grid max-w-3xl justify-items-center gap-4 sm:grid-cols-2"
      : "mx-auto mt-10 grid max-w-5xl justify-items-center gap-4 sm:grid-cols-2 lg:grid-cols-3";

  return (
    <section
      className="bg-zinc-50 py-14 dark:bg-neutral-950 md:py-20"
      aria-labelledby="home-featured-heading"
    >
      <div className="mx-auto max-w-6xl px-5 md:px-6">
        <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
          <div>
            <h2
              id="home-featured-heading"
              className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-white md:text-3xl"
            >
              En tienda ahora
            </h2>
            <p className="mt-2 max-w-xl text-sm text-zinc-600 dark:text-neutral-400 md:text-base">
              Productos activos del catálogo. Entrá al detalle para ver talles y disponibilidad.
            </p>
          </div>
          <Link
            href="/products"
            className="mt-4 inline-flex w-fit text-sm font-semibold text-sky-600 underline-offset-2 transition hover:text-sky-700 hover:underline dark:text-sky-400 dark:hover:text-sky-300"
          >
            Ver todo el catálogo
          </Link>
        </div>

        {items.length === 0 ? (
          <div className="mt-10 rounded-xl border border-dashed border-zinc-300 bg-white px-6 py-14 text-center shadow-sm dark:border-white/15 dark:bg-neutral-900/50">
            <p className="text-base font-medium text-zinc-900 dark:text-neutral-200">Próximamente nuevos ingresos</p>
            <p className="mx-auto mt-2 max-w-md text-sm text-zinc-600 dark:text-neutral-500">
              Cuando cargues productos activos en el admin, aparecerán aquí automáticamente.
            </p>
            <Link
              href="/products"
              className="mt-6 inline-flex rounded-md bg-sky-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-sky-600"
            >
              Ir a la tienda
            </Link>
          </div>
        ) : (
          <ul className={featuredGridClass}>
            {items.map((p) => (
              <li key={p.slug} className="h-full w-full max-w-74">
                <Link
                  href={`/products/${p.slug}`}
                  className="group flex h-full flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-lg shadow-zinc-300/30 ring-1 ring-zinc-200/80 transition hover:-translate-y-0.5 hover:border-sky-400/50 hover:shadow-sky-500/15 dark:border-white/10 dark:bg-neutral-900/90 dark:shadow-black/25 dark:ring-white/5 dark:hover:border-sky-500/45 dark:hover:shadow-sky-900/20"
                >
                  <div className="relative aspect-[15/9] overflow-hidden bg-linear-to-b from-white to-zinc-100 dark:from-neutral-900 dark:to-neutral-800">
                    {p.primaryImageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element -- catálogo remoto Supabase; sin optimizador en esta etapa
                      <img
                        src={p.primaryImageUrl}
                        alt={p.primaryImageAlt ?? p.title}
                        className="h-full w-full object-contain p-2.5 transition duration-300 group-hover:scale-[1.02]"
                        width={640}
                        height={480}
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xs text-zinc-500 dark:text-neutral-500">
                        Sin imagen
                      </div>
                    )}
                  </div>
                  <div className="flex min-h-30 flex-1 flex-col gap-1.5 p-3.5">
                    <span className="line-clamp-2 text-sm font-semibold leading-snug text-zinc-900 transition group-hover:text-sky-700 md:text-[0.95rem] dark:text-white dark:group-hover:text-sky-100">
                      {p.title}
                    </span>
                    <span className="text-xs text-zinc-600 dark:text-neutral-500">{p.productTypeLabel}</span>
                    <span
                      className={`mt-auto inline-flex w-fit rounded px-2 py-0.5 text-[11px] font-medium ${catalogListDeliveryBadgeClassName(
                        p.deliveryBadgeKind
                      )}`}
                    >
                      {catalogListDeliveryBadgeLabel(p.deliveryBadgeKind)}
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
