import Link from "next/link";
import { notFound } from "next/navigation";
import type { ProductType } from "@/modules/catalog";
import { resolveAvailability } from "@/modules/catalog";
import { labelVariantAvailability } from "@/modules/catalog/admin/variant-availability-label";
import { getCatalogProductWithVariantsById } from "@/modules/catalog/infrastructure/catalog-store";
import { CreateVariantForm } from "../_components/create-variant-form";
import { EditProductForm } from "../_components/edit-product-form";
import { VariantMatrixRow } from "../_components/variant-matrix-row";

export const dynamic = "force-dynamic";

const productTypeLabel: Record<ProductType, string> = {
  football_jersey: "Camiseta de futbol",
  nba_jersey: "Camiseta de basquet",
  jacket: "Campera",
};

type PageProps = {
  params: Promise<{ productId: string }>;
};

export default async function AdminEditProductPage({ params }: PageProps) {
  const { productId } = await params;
  const data = await getCatalogProductWithVariantsById(productId);
  if (!data) {
    notFound();
  }
  const { product, variants } = data;

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-10">
      <div className="flex flex-col gap-1">
        <Link className="tcds-link w-fit text-sm" href="/admin/products">
          ← Volver a productos
        </Link>
        <h1 className="tcds-title-page">Editar producto</h1>
        <p className="text-sm text-foreground">
          {productTypeLabel[product.productType]} · {product.title}
        </p>
      </div>

      <EditProductForm product={product} />

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-foreground">Variantes (precio por talle)</h2>
        <p className="tcds-prose text-xs">
          Disponibilidad: stock express &gt; 0; o encargo si no hay stock y el encargo esta
          activo. Estado se actualiza al guardar.
        </p>
        {variants.length === 0 ? (
          <p className="tcds-prose">Todavia no hay variantes. Agregá al menos un talle.</p>
        ) : (
          <div className="tcds-card overflow-hidden p-0">
            <div className="hidden gap-2 border-b border-border bg-surface/40 px-3 py-2 text-[10px] font-medium uppercase tracking-wide text-muted-foreground lg:grid lg:grid-cols-12">
              <span className="lg:col-span-1">Talle</span>
              <span className="lg:col-span-2">Precio</span>
              <span className="lg:col-span-1">Stock</span>
              <span className="lg:col-span-2">Encargo</span>
              <span className="lg:col-span-1">Min</span>
              <span className="lg:col-span-1">Max</span>
              <span className="lg:col-span-1">Estado</span>
              <span className="lg:col-span-2" />
            </div>
            {variants.map((record) => {
              const availability = resolveAvailability(record.variant);
              return (
                <VariantMatrixRow
                  key={record.variant.id}
                  productId={product.id}
                  record={record}
                  availabilityLabel={labelVariantAvailability(availability)}
                />
              );
            })}
          </div>
        )}
        <div>
          <h3 className="mb-2 text-xs font-semibold text-foreground">Otro talle (opcional)</h3>
          <CreateVariantForm productId={product.id} />
        </div>
      </section>
    </main>
  );
}
