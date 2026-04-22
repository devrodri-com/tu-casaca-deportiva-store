import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-6 py-10 md:py-16">
        <h1 className="text-3xl font-semibold leading-tight tracking-tight text-foreground">
          Camisetas de futbol y NBA listas para comprar
        </h1>
        <p className="max-w-2xl text-base leading-relaxed text-muted-foreground">
          Entrega rapida o por encargo. Personaliza tu camiseta.
        </p>
        <Link href="/products" className="tcds-btn-primary w-fit">
          Ver productos
        </Link>

        <section className="tcds-hero-surface text-sm text-foreground">
          <p>Entrega rapida: 24-48h</p>
          <p>Por encargo: 14-21 dias</p>
          <p>Personalizacion disponible</p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-sm font-medium text-foreground">Explorar por categoria</h2>
          <div className="flex flex-wrap gap-2">
            <Link href="/products?type=football_jersey" className="tcds-btn-secondary">
              Futbol
            </Link>
            <Link href="/products?type=nba_jersey" className="tcds-btn-secondary">
              NBA
            </Link>
            <Link href="/products?audience=kids" className="tcds-btn-secondary">
              Niños
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
