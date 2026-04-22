import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center gap-6 px-6 py-20">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
          Camisetas y ropa deportiva listas para comprar
        </h1>
        <p className="max-w-2xl text-base leading-relaxed text-foreground/80">
          Elegi entre productos con entrega rapida, opciones por encargo y
          personalizacion.
        </p>
        <Link
          className="w-fit rounded border px-4 py-2 text-sm font-medium"
          href="/products"
        >
          Ver productos
        </Link>
        <div className="rounded border bg-foreground/[0.03] p-4 text-sm text-foreground/90">
          <p>Entrega rapida: productos con stock para despacho en 24-48h.</p>
          <p>Por encargo: productos que se preparan en 14-21 dias.</p>
          <p>Personalizacion: siempre pasa a modalidad por encargo.</p>
        </div>
      </main>
    </div>
  );
}
