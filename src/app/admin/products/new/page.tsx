import Link from "next/link";
import { CreateProductForm } from "../_components/create-product-form";

export default function AdminNewProductPage() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-5 py-8 md:px-6">
      <header className="space-y-1 border-b border-border pb-5">
        <Link className="tcds-link text-sm" href="/admin/products">
          ← Volver a productos
        </Link>
        <p className="pt-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          Catálogo
        </p>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Nuevo producto</h1>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Despues de crear, vas a la ficha para cargar imágenes, stock por talle y encargo.
        </p>
      </header>
      <CreateProductForm />
    </main>
  );
}
