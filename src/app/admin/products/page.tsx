import Link from "next/link";
import type { ProductType } from "@/modules/catalog";
import { parseAdminProductListQuery } from "@/modules/catalog/admin/admin-product-list-query";
import { listAdminCatalogProductsWithVariants } from "@/modules/catalog/infrastructure/admin-catalog-product-list";
import { adminChip, adminTableTheadClass } from "../_lib/admin-ui-classes";
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
    return "-";
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
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-5 px-5 py-8 md:px-6">
      <header className="flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0 space-y-1">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            Catálogo
          </p>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Productos</h1>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Filtrá por estado, tipo y público. El interruptor activa o desactiva la visibilidad en
            tienda; stock express y variantes se editan en cada ficha.
          </p>
        </div>
        <Link
          className="tcds-btn-primary shrink-0 text-sm font-semibold"
          href="/admin/products/new"
        >
          Nuevo producto
        </Link>
      </header>

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
        <div className="tcds-card overflow-hidden p-0">
          <div className="max-w-full overflow-x-auto">
            <table className="w-full min-w-[920px] text-left text-sm">
              <thead>
                <tr className={adminTableTheadClass}>
                  <th className="px-3 py-2.5 font-medium">Producto</th>
                  <th className="px-3 py-2.5 font-medium">Estado</th>
                  <th className="px-3 py-2.5 font-medium">Tipo</th>
                  <th className="px-3 py-2.5 font-medium">Publico</th>
                  <th className="px-3 py-2.5 font-medium">Entidad</th>
                  <th className="px-3 py-2.5 font-medium">Era</th>
                  <th className="px-3 py-2.5 font-medium">Pers.</th>
                  <th className="px-3 py-2.5 font-medium" title="Cantidad de variantes">
                    Var.
                  </th>
                  <th className="px-3 py-2.5 font-medium" title="Suma stock express">
                    Stk. exp.
                  </th>
                  <th className="px-3 py-2.5 font-medium">Precio</th>
                  <th className="px-3 py-2.5 text-right font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {products.map(({ product, variants, totalExpressStock }) => {
                  const aud = product.audience === "adult" ? "Adulto" : "Niños";
                  const pers =
                    product.supportsCustomization && product.customizationSurcharge !== null
                      ? `Si (+$${product.customizationSurcharge})`
                      : "No";
                  const stockMuted = totalExpressStock === 0;
                  return (
                    <tr
                      key={product.id}
                      className="border-b border-border last:border-0 hover:bg-surface/40 dark:hover:bg-white/5"
                    >
                      <td className="max-w-[14rem] px-3 py-2.5 align-top">
                        <Link
                          href={`/admin/products/${product.id}`}
                          className="tcds-link line-clamp-2 font-medium text-foreground"
                        >
                          {product.title}
                        </Link>
                      </td>
                      <td className="px-3 py-2.5 align-top text-muted-foreground">
                        <div className="flex flex-col gap-1.5">
                          <span
                            className={`inline-flex w-fit rounded px-2 py-0.5 text-[11px] font-medium ${
                              product.isActive ? adminChip.emerald : adminChip.inactive
                            }`}
                          >
                            {product.isActive ? "Activo" : "Inactivo"}
                          </span>
                          <ProductActiveToggle productId={product.id} isActive={product.isActive} />
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-2.5 text-muted-foreground">
                        {productTypeLabel[product.productType]}
                      </td>
                      <td className="whitespace-nowrap px-3 py-2.5 text-muted-foreground">{aud}</td>
                      <td className="max-w-[10rem] truncate px-3 py-2.5 text-muted-foreground" title={product.entity.name}>
                        {product.entity.name}
                      </td>
                      <td className="whitespace-nowrap px-3 py-2.5 text-muted-foreground">
                        {product.era === "current" ? "Actual" : "Retro"}
                      </td>
                      <td className="whitespace-nowrap px-3 py-2.5 text-muted-foreground">{pers}</td>
                      <td className="whitespace-nowrap px-3 py-2.5 tabular-nums text-muted-foreground">
                        {variants.length}
                      </td>
                      <td className="whitespace-nowrap px-3 py-2.5 tabular-nums">
                        <span
                          className={
                            stockMuted
                              ? "font-medium text-muted-foreground"
                              : "font-medium text-foreground"
                          }
                        >
                          {totalExpressStock}
                        </span>
                        <span className="text-muted-foreground"> u.</span>
                      </td>
                      <td className="whitespace-nowrap px-3 py-2.5 font-medium tabular-nums text-foreground">
                        {minPriceFromVariants(variants)}
                      </td>
                      <td className="px-3 py-2.5 text-right">
                        <div className="flex flex-col items-end gap-2">
                          <Link className="tcds-link text-sm" href={`/admin/products/${product.id}`}>
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
        </div>
      )}
    </main>
  );
}
