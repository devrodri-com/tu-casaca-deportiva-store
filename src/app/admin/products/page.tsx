import Link from "next/link";
import type { ProductType } from "@/modules/catalog";
import { parseAdminProductListQuery } from "@/modules/catalog/admin/admin-product-list-query";
import { listAdminCatalogProductsWithVariants } from "@/modules/catalog/infrastructure/admin-catalog-product-list";
import { AdminDeleteProductButton } from "./_components/admin-delete-product-button";
import { AdminProductsFilterBar } from "./_components/admin-products-filter-bar";
import { ProductActiveToggle } from "./_components/product-active-toggle";

export const dynamic = "force-dynamic";

const productTypeLabel: Record<ProductType, string> = {
  football_jersey: "Camiseta de futbol",
  nba_jersey: "Camiseta de basquet",
  jacket: "Campera",
};

function minPriceFromVariants(prices: { unitBasePrice: number }[]): string {
  if (prices.length === 0) {
    return "—";
  }
  const min = Math.min(...prices.map((p) => p.unitBasePrice));
  return `desde $${min}`;
}

type AdminProductsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AdminProductsPage({ searchParams }: AdminProductsPageProps) {
  const raw = await searchParams;
  const query = parseAdminProductListQuery(raw);
  const list = await listAdminCatalogProductsWithVariants(query);
  const products = [...list].sort((a, b) =>
    a.product.title.localeCompare(b.product.title, "es")
  );

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-6 py-10">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <h1 className="tcds-title-page">Admin · Productos</h1>
        <Link className="tcds-btn-primary w-fit text-sm" href="/admin/products/new">
          Nuevo producto
        </Link>
      </div>

      <AdminProductsFilterBar
        key={[
          query.search,
          query.status,
          query.productType,
          query.audience,
          query.customization,
        ].join("|")}
        query={query}
      />

      {products.length === 0 ? (
        <p className="tcds-prose">No hay productos con estos criterios.</p>
      ) : (
        <div className="tcds-card overflow-x-auto p-0">
          <table className="w-full min-w-[980px] text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-surface/50 text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-3 py-2 font-medium">Producto</th>
                <th className="px-3 py-2 font-medium">Estado</th>
                <th className="px-3 py-2 font-medium">Tipo</th>
                <th className="px-3 py-2 font-medium">Publico</th>
                <th className="px-3 py-2 font-medium">Entidad</th>
                <th className="px-3 py-2 font-medium">Era</th>
                <th className="px-3 py-2 font-medium">Pers.</th>
                <th className="px-3 py-2 font-medium">Var.</th>
                <th className="px-3 py-2 font-medium">Stock exp.</th>
                <th className="px-3 py-2 font-medium">Precio</th>
                <th className="px-3 py-2 font-medium text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {products.map(({ product, variants, totalExpressStock }) => {
                const aud = product.audience === "adult" ? "Adulto" : "Niños";
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
                    <td className="px-3 py-2 align-top text-muted-foreground">
                      <div className="flex flex-col gap-1">
                        <span
                          className={`inline-flex w-fit rounded px-2 py-0.5 text-[11px] font-medium ${
                            product.isActive
                              ? "border border-emerald-200 bg-emerald-50 text-emerald-900"
                              : "border border-neutral-300 bg-neutral-100 text-neutral-700"
                          }`}
                        >
                          {product.isActive ? "Activo" : "Inactivo"}
                        </span>
                        <ProductActiveToggle productId={product.id} isActive={product.isActive} />
                      </div>
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
                    <td className="px-3 py-2 tabular-nums font-medium text-foreground">
                      {totalExpressStock} stock
                    </td>
                    <td className="px-3 py-2 font-medium tabular-nums text-foreground">
                      {minPriceFromVariants(variants)}
                    </td>
                    <td className="px-3 py-2 text-right">
                      <div className="flex flex-col items-end gap-2">
                        <Link
                          className="tcds-link text-sm"
                          href={`/admin/products/${product.id}`}
                        >
                          Editar
                        </Link>
                        <AdminDeleteProductButton
                          productId={product.id}
                          productTitle={product.title}
                        />
                      </div>
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
