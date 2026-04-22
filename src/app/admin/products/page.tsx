import { listCatalogProductsWithVariants } from "@/modules/catalog/infrastructure/catalog-store";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const products = await listCatalogProductsWithVariants();

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-col gap-4 px-6 py-10">
      <h1 className="tcds-title-page">Admin · Productos</h1>
      {products.length === 0 ? (
        <p className="tcds-prose">No hay productos.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {products.map(({ product, variants }) => (
            <li key={product.id} className="tcds-card p-3 text-sm text-foreground">
              <p className="font-medium">{product.title}</p>
              <ul className="mt-2 flex flex-col gap-2">
                {variants.map(({ variant }) => (
                  <li key={variant.id} className="tcds-card p-2">
                    <p>
                      size: {variant.size} · express_stock: {variant.expressStock}
                    </p>
                    <form
                      action="/api/admin/variants/stock"
                      method="post"
                      className="mt-2 flex flex-wrap items-center gap-2"
                    >
                      <input type="hidden" name="variantId" value={variant.id} />
                      <input
                        type="number"
                        min={0}
                        step={1}
                        name="expressStock"
                        defaultValue={variant.expressStock}
                        className="tcds-input w-24"
                      />
                      <button type="submit" className="tcds-btn-secondary">
                        Guardar stock
                      </button>
                    </form>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
