import Link from "next/link";
import { StoreProductsEmptyState } from "@/app/products/_components/store-products-empty-state";
import { StoreProductsFilterBar } from "@/app/products/_components/store-products-filter-bar";
import { StoreProductCard } from "@/app/products/_components/store-product-card";
import { StorePublicFooter } from "@/components/storefront/store-public-footer";
import { StorePublicHeader } from "@/components/storefront/store-public-header";
import { getCatalogProductList } from "@/modules/catalog/application/get-catalog-product-list";

export const dynamic = "force-dynamic";

type ProductsPageProps = {
  searchParams: Promise<{ type?: string; audience?: string }>;
};

function isValidProductType(value: string | undefined): value is "football_jersey" | "nba_jersey" | "jacket" {
  return value === "football_jersey" || value === "nba_jersey" || value === "jacket";
}

function isValidAudience(value: string | undefined): value is "adult" | "kids" {
  return value === "adult" || value === "kids";
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams;
  const products = await getCatalogProductList();
  const selectedType = isValidProductType(params.type) ? params.type : null;
  const selectedAudience = isValidAudience(params.audience) ? params.audience : null;

  const filteredProducts = products.filter((product) => {
    if (selectedType && product.productType !== selectedType) {
      return false;
    }
    if (selectedAudience && product.audience !== selectedAudience) {
      return false;
    }
    return true;
  });

  const hasActiveFilter = selectedType !== null || selectedAudience !== null;
  const productGridClass =
    filteredProducts.length <= 2
      ? "mx-auto mt-7 grid max-w-4xl items-stretch gap-4 sm:grid-cols-2"
      : "mt-7 grid items-stretch gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4";

  return (
    <div className="flex min-h-dvh flex-col bg-neutral-950 text-neutral-100">
      <StorePublicHeader variant="dark" />
      <main className="mx-auto w-full max-w-7xl flex-1 px-5 py-9 md:px-6 md:py-12">
        <section className="mx-auto max-w-3xl text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-sky-400/90">
            TIENDA
          </p>
          <h1 className="mt-2.5 text-4xl font-semibold tracking-tight text-white md:text-5xl">
            Catálogo
          </h1>
          <p className="mt-3.5 text-sm leading-relaxed text-neutral-300 md:text-base">
            Elegí tu casaca por categoría, disponibilidad y estilo. Stock express 24–48 h o pedidos
            por encargo cuando el talle no está disponible, con personalización en productos
            habilitados.
          </p>
          <StoreProductsFilterBar selectedType={selectedType} selectedAudience={selectedAudience} />
          {hasActiveFilter ? (
            <p className="mt-3 text-center text-xs text-neutral-500">
              Estás viendo productos filtrados.{" "}
              <Link href="/products" className="text-sky-400 hover:text-sky-300 hover:underline">
                Ver catálogo completo
              </Link>
            </p>
          ) : null}
        </section>

        {filteredProducts.length === 0 ? (
          <StoreProductsEmptyState />
        ) : (
          <ul className={productGridClass}>
            {filteredProducts.map((product) => (
              <li key={product.slug} className="h-full">
                <StoreProductCard product={product} />
              </li>
            ))}
          </ul>
        )}
      </main>
      <StorePublicFooter variant="dark" />
    </div>
  );
}
