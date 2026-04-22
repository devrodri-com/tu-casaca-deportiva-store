import Link from "next/link";
import { getCatalogProductList } from "@/modules/catalog/application/get-catalog-product-list";

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  const products = await getCatalogProductList();

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-6 py-10">
      <h1 className="text-2xl font-semibold">Productos</h1>

      {products.length === 0 ? (
        <p className="text-sm text-foreground/80">No hay productos cargados.</p>
      ) : (
        <ul className="flex flex-col gap-4">
          {products.map((product) => (
            <li key={product.slug} className="rounded border p-4">
              <div className="mb-2 flex items-center gap-2">
                <h2 className="text-lg font-medium">{product.title}</h2>
                <span className="rounded border px-2 py-0.5 text-xs">
                  {product.deliveryBadgeLabel}
                </span>
              </div>
              <p className="text-sm text-foreground/80">{product.audienceLabel}</p>
              <p className="text-sm text-foreground/80">{product.productTypeLabel}</p>
              <Link className="text-sm underline" href={`/products/${product.slug}`}>
                Ver detalle
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
