import Link from "next/link";
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

function getTypeLabel(type: "football_jersey" | "nba_jersey" | "jacket"): string {
  if (type === "football_jersey") {
    return "Futbol";
  }
  if (type === "nba_jersey") {
    return "NBA";
  }
  return "Campera";
}

function getAudienceLabel(audience: "adult" | "kids"): string {
  return audience === "adult" ? "Adulto" : "Ninos";
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

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-6 py-8 md:py-10">
      <h1 className="text-2xl font-semibold">Productos</h1>
      <p className="text-sm text-foreground/80">
        Elegi tu camiseta por tipo, publico y modalidad de entrega.
      </p>

      {hasActiveFilter ? (
        <div className="flex items-center justify-between rounded border bg-foreground/3 px-3 py-2 text-sm">
          <p>
            Filtro activo: {selectedType ? `tipo ${getTypeLabel(selectedType)}` : "todos los tipos"}
            {selectedAudience ? ` + publico ${getAudienceLabel(selectedAudience)}` : ""}
          </p>
          <Link href="/products" className="underline">
            Limpiar
          </Link>
        </div>
      ) : null}

      {filteredProducts.length === 0 ? (
        <p className="text-sm text-foreground/80">
          No encontramos productos para ese filtro.
        </p>
      ) : (
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {filteredProducts.map((product) => (
            <li key={product.slug}>
              <Link
                className="block rounded border p-4 transition-colors hover:bg-foreground/3"
                href={`/products/${product.slug}`}
              >
                <div className="mb-3 flex items-start justify-between gap-3">
                  <h2 className="text-lg font-medium">{product.title}</h2>
                  <span className="rounded border px-2 py-0.5 text-xs">
                    {product.deliveryBadgeLabel}
                  </span>
                </div>
                <p className="text-sm text-foreground/80">Tipo: {product.productTypeLabel}</p>
                <p className="text-sm text-foreground/80">Para: {product.audienceLabel}</p>
                <p className="mt-2 text-sm underline">Ver producto</p>
              </Link>
            </li>
          ))}
        </ul>
      )}

      {!hasActiveFilter ? (
        <div className="flex flex-wrap gap-2 text-sm">
          <Link href="/products?type=football_jersey" className="rounded border px-3 py-1">
            Futbol
          </Link>
          <Link href="/products?type=nba_jersey" className="rounded border px-3 py-1">
            NBA
          </Link>
          <Link href="/products?audience=kids" className="rounded border px-3 py-1">
            Ninos
          </Link>
        </div>
      ) : null}
    </main>
  );
}
