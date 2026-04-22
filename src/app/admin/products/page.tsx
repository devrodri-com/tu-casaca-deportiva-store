import Link from "next/link";
import type { ProductType } from "@/modules/catalog";
import { listCatalogProductsWithVariants } from "@/modules/catalog/infrastructure/catalog-store";

export const dynamic = "force-dynamic";

const productTypeLabel: Record<ProductType, string> = {
  football_jersey: "Camiseta de futbol",
  nba_jersey: "Camiseta de basquet",
  jacket: "Campera",
};

function minPriceFromVariants(
  prices: { unitBasePrice: number }[]
): string {
  if (prices.length === 0) {
    return "—";
  }
  const min = Math.min(...prices.map((p) => p.unitBasePrice));
  return `desde $${min}`;
}

export default async function AdminProductsPage() {
  const list = await listCatalogProductsWithVariants();
  const products = [...list].sort((a, b) =>
    a.product.title.localeCompare(b.product.title, "es")
  );

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-4 px-6 py-10">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <h1 className="tcds-title-page">Admin · Productos</h1>
        <Link className="tcds-btn-primary w-fit text-sm" href="/admin/products/new">
          Nuevo producto
        </Link>
      </div>

      {products.length === 0 ? (
        <p className="tcds-prose">No hay productos. Creá el primero.</p>
      ) : (
        <div className="tcds-card overflow-x-auto p-0">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-surface/50 text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-3 py-2 font-medium">Producto</th>
                <th className="px-3 py-2 font-medium">Tipo</th>
                <th className="px-3 py-2 font-medium">Publico</th>
                <th className="px-3 py-2 font-medium">Entidad</th>
                <th className="px-3 py-2 font-medium">Era</th>
                <th className="px-3 py-2 font-medium">Pers.</th>
                <th className="px-3 py-2 font-medium">Var.</th>
                <th className="px-3 py-2 font-medium">Precio</th>
                <th className="px-3 py-2 font-medium" />
              </tr>
            </thead>
            <tbody>
              {products.map(({ product, variants }) => {
                const aud = product.audience === "adult" ? "Adulto" : "Ninos";
                const pers =
                  product.supportsCustomization && product.customizationSurcharge !== null
                    ? `Si (+$${product.customizationSurcharge})`
                    : "No";
                return (
                  <tr
                    key={product.id}
                    className="border-b border-border last:border-0 hover:bg-surface/30"
                  >
                    <td className="px-3 py-2 font-medium text-foreground">
                      {product.title}
                    </td>
                    <td className="px-3 py-2 text-muted-foreground">
                      {productTypeLabel[product.productType]}
                    </td>
                    <td className="px-3 py-2 text-muted-foreground">{aud}</td>
                    <td className="px-3 py-2 text-muted-foreground">{product.entity.name}</td>
                    <td className="px-3 py-2 text-muted-foreground">
                      {product.era === "current" ? "Actual" : "Retro"}
                    </td>
                    <td className="px-3 py-2 text-muted-foreground">{pers}</td>
                    <td className="px-3 py-2 tabular-nums text-muted-foreground">
                      {variants.length}
                    </td>
                    <td className="px-3 py-2 font-medium tabular-nums text-foreground">
                      {minPriceFromVariants(variants)}
                    </td>
                    <td className="px-3 py-2 text-right">
                      <Link
                        className="tcds-link text-sm"
                        href={`/admin/products/${product.id}`}
                      >
                        Editar
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
