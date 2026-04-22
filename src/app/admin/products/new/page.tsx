import Link from "next/link";
import { CreateProductForm } from "../_components/create-product-form";

export default function AdminNewProductPage() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-4 px-6 py-10">
      <div className="flex flex-col gap-1">
        <Link className="tcds-link w-fit text-sm" href="/admin/products">
          ← Volver a productos
        </Link>
        <h1 className="tcds-title-page">Nuevo producto</h1>
        <p className="tcds-prose">Completa los datos del producto. Luego podes agregar talles y precio por variante.</p>
      </div>
      <CreateProductForm />
    </main>
  );
}
