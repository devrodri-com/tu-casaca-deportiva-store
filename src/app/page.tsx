import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-6 py-10 md:py-16">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
          Camisetas de futbol y NBA listas para comprar
        </h1>
        <p className="max-w-2xl text-base leading-relaxed text-foreground/80">
          Entrega rapida o por encargo. Personaliza tu camiseta.
        </p>
        <Link
          href="/products"
          className="w-fit rounded border px-4 py-2 text-sm font-medium hover:bg-foreground/5"
        >
          Ver productos
        </Link>

        <section className="rounded border bg-foreground/3 p-4 text-sm text-foreground/90">
          <p>Entrega rapida: 24-48h</p>
          <p>Por encargo: 14-21 dias</p>
          <p>Personalizacion disponible</p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-sm font-medium">Explorar por categoria</h2>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/products?type=football_jersey"
              className="rounded border px-3 py-1 text-sm hover:bg-foreground/5"
            >
              Futbol
            </Link>
            <Link
              href="/products?type=nba_jersey"
              className="rounded border px-3 py-1 text-sm hover:bg-foreground/5"
            >
              NBA
            </Link>
            <Link
              href="/products?audience=kids"
              className="rounded border px-3 py-1 text-sm hover:bg-foreground/5"
            >
              Ninos
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
