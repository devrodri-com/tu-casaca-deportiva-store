import Link from "next/link";

const CATEGORIES = [
  {
    href: "/products?type=football_jersey",
    label: "Fútbol",
    line: "Clubes y selecciones",
    gradientClass: "bg-gradient-to-br from-emerald-900/40 to-transparent",
  },
  {
    href: "/products?type=nba_jersey",
    label: "NBA",
    line: "Franquicias y camisetas pro",
    gradientClass: "bg-gradient-to-br from-orange-900/35 to-transparent",
  },
  {
    href: "/products?audience=kids",
    label: "Niños",
    line: "Talles y equipos para chicos",
    gradientClass: "bg-gradient-to-br from-sky-900/40 to-transparent",
  },
] as const;

export function HomeCategoryGrid() {
  return (
    <section className="border-b border-white/10 bg-neutral-950 py-14 md:py-20" aria-labelledby="home-categories-heading">
      <div className="mx-auto max-w-6xl px-5 md:px-6">
        <h2
          id="home-categories-heading"
          className="text-2xl font-semibold tracking-tight text-white md:text-3xl"
        >
          Elegí categoría
        </h2>
        <p className="mt-2 max-w-xl text-sm text-neutral-400 md:text-base">
          Tres entradas claras al catálogo. Mismo stock y precios que en la tienda.
        </p>
        <ul className="mt-10 grid gap-5 md:grid-cols-3 md:gap-6">
          {CATEGORIES.map((cat) => (
            <li key={cat.href}>
              <Link
                href={cat.href}
                className="group relative flex min-h-[11rem] flex-col justify-end overflow-hidden rounded-xl border border-white/10 bg-neutral-900 p-6 shadow-lg transition hover:border-sky-500/50 hover:shadow-sky-900/20 md:min-h-[13rem]"
              >
                <div
                  className={`pointer-events-none absolute inset-0 opacity-90 ${cat.gradientClass}`}
                  aria-hidden
                />
                <div className="relative">
                  <span className="text-xs font-semibold uppercase tracking-widest text-sky-400">
                    Colección
                  </span>
                  <span className="mt-2 block text-2xl font-semibold text-white md:text-3xl">
                    {cat.label}
                  </span>
                  <span className="mt-1 block text-sm text-neutral-400">{cat.line}</span>
                  <span className="mt-4 inline-flex text-sm font-semibold text-sky-400 transition group-hover:text-sky-300">
                    Explorar →
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
