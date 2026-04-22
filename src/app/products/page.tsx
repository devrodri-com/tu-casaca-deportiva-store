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

function deliveryBadgeClassName(
  label: "Entrega rapida" | "Por encargo" | "Sin stock"
): string {
  switch (label) {
    case "Entrega rapida":
      return "border border-emerald-200 bg-emerald-50 text-emerald-800";
    case "Por encargo":
      return "border border-sky-100 bg-sky-50 text-sky-800";
    default:
      return "border border-red-200 bg-red-50 text-red-800";
  }
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
      <h1 className="tcds-title-page">Productos</h1>
      <p className="tcds-prose">
        Elegi tu camiseta por tipo, publico y modalidad de entrega.
      </p>

      {hasActiveFilter ? (
        <div className="tcds-card flex items-center justify-between gap-3 px-3 py-2 text-sm">
          <p className="text-foreground">
            Filtro activo: {selectedType ? `tipo ${getTypeLabel(selectedType)}` : "todos los tipos"}
            {selectedAudience ? ` + publico ${getAudienceLabel(selectedAudience)}` : ""}
          </p>
          <Link href="/products" className="tcds-link flex-shrink-0 text-sm">
            Limpiar
          </Link>
        </div>
      ) : null}

      {filteredProducts.length === 0 ? (
        <p className="tcds-prose">No encontramos productos para ese filtro.</p>
      ) : (
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {filteredProducts.map((product) => (
            <li key={product.slug}>
              <Link
                className="tcds-card block p-4 transition-shadow hover:shadow-md"
                href={`/products/${product.slug}`}
              >
                <div className="mb-3 flex items-start justify-between gap-3">
                  <h2 className="text-lg font-medium text-foreground">{product.title}</h2>
                  <span
                    className={`whitespace-nowrap rounded px-2 py-0.5 text-xs font-medium ${deliveryBadgeClassName(
                      product.deliveryBadgeLabel
                    )}`}
                  >
                    {product.deliveryBadgeLabel}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">Tipo: {product.productTypeLabel}</p>
                <p className="text-sm text-muted-foreground">Para: {product.audienceLabel}</p>
                <p className="tcds-link mt-3 inline-block text-sm">Ver producto</p>
              </Link>
            </li>
          ))}
        </ul>
      )}

      {!hasActiveFilter ? (
        <div className="flex flex-wrap gap-2 text-sm">
          <Link href="/products?type=football_jersey" className="tcds-btn-secondary">
            Futbol
          </Link>
          <Link href="/products?type=nba_jersey" className="tcds-btn-secondary">
            NBA
          </Link>
          <Link href="/products?audience=kids" className="tcds-btn-secondary">
            Ninos
          </Link>
        </div>
      ) : null}
    </main>
  );
}
