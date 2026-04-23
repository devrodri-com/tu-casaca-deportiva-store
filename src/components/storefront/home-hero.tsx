import Link from "next/link";

export function HomeHero() {
  return (
    <section
      className="relative overflow-hidden border-b border-white/10"
      aria-labelledby="home-hero-heading"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(14,165,233,0.22),transparent)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,transparent,rgba(0,0,0,0.55))]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
        aria-hidden
      />

      <div className="relative mx-auto flex max-w-6xl flex-col gap-8 px-5 py-16 md:gap-10 md:px-6 md:py-24 lg:py-28">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-400">
            Tienda deportiva
          </p>
          <h1
            id="home-hero-heading"
            className="mt-3 text-4xl font-semibold leading-[1.08] tracking-tight text-white md:text-5xl lg:text-6xl"
          >
            Tu camiseta, con entrega que cumple.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-neutral-300 md:text-lg">
            Stock express y pedidos por encargo. Personalización disponible en productos
            seleccionados.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <Link
            href="/products"
            className="inline-flex w-fit items-center justify-center rounded-md bg-sky-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-sky-900/30 transition hover:bg-sky-600 focus-visible:outline focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950"
          >
            Ver catálogo
          </Link>
          <Link
            href="/products?type=football_jersey"
            className="inline-flex w-fit items-center justify-center rounded-md border border-white/25 bg-white/5 px-5 py-3 text-sm font-semibold text-white backdrop-blur-sm transition hover:border-white/40 hover:bg-white/10"
          >
            Ver fútbol
          </Link>
          <Link
            href="/products?type=nba_jersey"
            className="inline-flex w-fit items-center justify-center rounded-md border border-white/25 bg-white/5 px-5 py-3 text-sm font-semibold text-white backdrop-blur-sm transition hover:border-white/40 hover:bg-white/10"
          >
            Ver NBA
          </Link>
        </div>
      </div>
    </section>
  );
}
