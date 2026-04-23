import Image from "next/image";
import Link from "next/link";

const CATEGORIES = [
  {
    href: "/products?type=football_jersey",
    label: "Fútbol",
    line: "Clubes y selecciones",
    image: "/home/category-football.jpg",
  },
  {
    href: "/products?type=nba_jersey",
    label: "NBA",
    line: "Franquicias y camisetas pro",
    image: "/home/category-nba.jpg",
  },
  {
    href: "/products?audience=kids",
    label: "Niños",
    line: "Talles y equipos para chicos",
    image: "/home/category-kids.jpg",
  },
] as const;

export function HomeCategoryGrid() {
  return (
    <section
      className="bg-zinc-50 py-12 dark:bg-neutral-950 md:py-20"
      aria-labelledby="home-categories-heading"
    >
      <div className="mx-auto max-w-6xl px-5 md:px-6">
        <p className="text-center text-[11px] font-semibold uppercase tracking-[0.3em] text-sky-400/90">
          EXPLORÁ LA TIENDA
        </p>
        <h2
          id="home-categories-heading"
          className="mt-3 text-center text-3xl font-semibold tracking-tight text-zinc-900 dark:text-white sm:text-4xl md:mt-4 md:text-[2.4rem] md:leading-tight"
        >
          Explorar por categoría
        </h2>
        <ul className="mt-8 grid gap-4 sm:mt-10 md:grid-cols-3 md:gap-6">
          {CATEGORIES.map((cat) => (
            <li key={cat.href}>
              <Link
                href={cat.href}
                className="group relative block min-h-70 overflow-hidden rounded-2xl border border-white/10 bg-neutral-900 shadow-lg transition hover:border-sky-500/35 hover:shadow-sky-950/30 md:min-h-80 lg:min-h-88"
              >
                <Image
                  src={cat.image}
                  alt=""
                  fill
                  className="object-cover transition duration-500 group-hover:scale-[1.03]"
                  sizes="(min-width: 768px) 33vw, 100vw"
                />
                <div
                  className="absolute inset-0 bg-linear-to-t from-black/95 via-black/40 to-black/5"
                  aria-hidden
                />
                <div className="absolute inset-0 z-10 flex flex-col justify-end p-6 md:p-8">
                  <span className="text-2xl font-bold leading-none tracking-tight text-white sm:text-3xl">
                    {cat.label}
                  </span>
                  <span className="mt-1.5 max-w-sm text-sm text-neutral-200/90">{cat.line}</span>
                  <span className="mt-5 inline-flex w-fit border-b border-sky-400/70 pb-0.5 text-sm font-semibold text-sky-300 transition group-hover:border-sky-300 group-hover:text-sky-200">
                    Ver colección
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
