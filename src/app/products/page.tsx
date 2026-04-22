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
              <h2 className="text-lg font-medium">{product.title}</h2>
              <p className="text-sm text-foreground/80">
                audience: {product.audience}
              </p>
              <p className="text-sm text-foreground/80">
                productType: {product.productType}
              </p>
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
