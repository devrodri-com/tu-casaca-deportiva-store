import Link from "next/link";
import type { CatalogProductListItem } from "@/modules/catalog/application/get-catalog-product-list";

type HomeFeaturedProductsProps = {
  items: CatalogProductListItem[];
};

export function HomeFeaturedProducts({ items }: HomeFeaturedProductsProps) {
  return (
    <section
      className="border-b border-white/10 bg-neutral-950 py-14 md:py-20"
      aria-labelledby="home-featured-heading"
    >
      <div className="mx-auto max-w-6xl px-5 md:px-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <h2
              id="home-featured-heading"
              className="text-2xl font-semibold tracking-tight text-white md:text-3xl"
            >
              En tienda ahora
            </h2>
            <p className="mt-2 max-w-lg text-sm text-neutral-400 md:text-base">
              Productos activos del catálogo. Entrá al detalle para ver talles y disponibilidad.
            </p>
          </div>
          <Link
            href="/products"
            className="w-fit text-sm font-semibold text-sky-400 hover:text-sky-300 hover:underline"
          >
            Ver todo el catálogo
          </Link>
        </div>

        {items.length === 0 ? (
          <div className="mt-10 rounded-xl border border-dashed border-white/15 bg-neutral-900/50 px-6 py-14 text-center">
            <p className="text-base font-medium text-neutral-200">Próximamente nuevos ingresos</p>
            <p className="mx-auto mt-2 max-w-md text-sm text-neutral-500">
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
          <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((p) => (
              <li key={p.slug}>
                <Link
                  href={`/products/${p.slug}`}
                  className="group flex flex-col overflow-hidden rounded-xl border border-white/10 bg-neutral-900 transition hover:border-sky-500/40"
                >
                  <div className="relative aspect-[4/3] bg-neutral-800">
                    {p.primaryImageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element -- catálogo remoto Supabase; sin optimizador en esta etapa
                      <img
                        src={p.primaryImageUrl}
                        alt={p.primaryImageAlt ?? p.title}
                        className="h-full w-full object-cover transition group-hover:opacity-95"
                        width={640}
                        height={480}
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xs text-neutral-500">
                        Sin imagen
                      </div>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col gap-2 p-4">
                    <span className="line-clamp-2 text-base font-semibold leading-snug text-white group-hover:text-sky-100">
                      {p.title}
                    </span>
                    <span className="text-xs text-neutral-500">{p.productTypeLabel}</span>
                    <span
                      className={`mt-auto inline-flex w-fit rounded px-2 py-0.5 text-[11px] font-medium ${
                        p.deliveryBadgeLabel === "Entrega rapida"
                          ? "border border-emerald-800/50 bg-emerald-950/50 text-emerald-300"
                          : p.deliveryBadgeLabel === "Por encargo"
                            ? "border border-sky-800/40 bg-sky-950/40 text-sky-200"
                            : "border border-neutral-700 bg-neutral-800 text-neutral-400"
                      }`}
                    >
                      {p.deliveryBadgeLabel}
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
