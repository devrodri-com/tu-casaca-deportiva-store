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
      className="border-b border-white/10 bg-neutral-950 py-14 md:py-20"
      aria-labelledby="home-categories-heading"
    >
      <div className="mx-auto max-w-6xl px-5 md:px-6">
        <h2
          id="home-categories-heading"
          className="text-2xl font-semibold tracking-tight text-white md:text-3xl"
        >
          Elegí categoría
        </h2>
        <p className="mt-2 max-w-xl text-sm text-neutral-400 md:text-base">
          Entradas principales a Tu Casaca Deportiva. Mismo stock y precios que en la tienda.
        </p>
        <ul className="mt-10 grid gap-5 md:grid-cols-3 md:gap-6">
          {CATEGORIES.map((cat) => (
            <li key={cat.href}>
              <Link
                href={cat.href}
                className="group relative block min-h-[18rem] overflow-hidden rounded-2xl border border-white/10 bg-neutral-900 shadow-lg transition hover:border-sky-500/40 hover:shadow-sky-900/20 md:min-h-[20rem]"
              >
                <Image
                  src={cat.image}
                  alt=""
                  fill
                  className="object-cover transition duration-500 group-hover:scale-[1.03]"
                  sizes="(min-width: 768px) 33vw, 100vw"
                />
                <div
                  className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-black/20"
                  aria-hidden
                />
                <div className="absolute inset-0 z-10 flex flex-col justify-end p-6 md:p-7">
                  <span className="text-xs font-semibold uppercase tracking-widest text-sky-300">
                    Categoría
                  </span>
                  <span className="mt-1 block text-2xl font-bold tracking-tight text-white md:text-3xl">
                    {cat.label}
                  </span>
                  <span className="mt-1.5 text-sm text-neutral-200">{cat.line}</span>
                  <span className="mt-5 inline-flex w-fit text-sm font-semibold text-sky-400 transition group-hover:text-sky-300">
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
