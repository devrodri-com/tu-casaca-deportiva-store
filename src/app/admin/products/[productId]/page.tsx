import { notFound } from "next/navigation";
import { resolveAvailability } from "@/modules/catalog";
import { getCatalogProductWithVariantsById } from "@/modules/catalog/infrastructure/catalog-store";
import { listProductImagesByProductId } from "@/modules/catalog/infrastructure/product-images-store";
import { AdminProductPageHeader } from "../_components/admin-product-page-header";
import { AdminFormSection } from "../_components/admin-form-section";
import { CreateVariantForm } from "../_components/create-variant-form";
import { EditProductForm } from "../_components/edit-product-form";
import { ProductImagesPanel } from "../_components/product-images-panel";
import { VariantMatrixRow } from "../_components/variant-matrix-row";

export const dynamic = "force-dynamic";

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
  const productImages = await listProductImagesByProductId(productId);

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-5 py-8 md:px-6">
      <AdminProductPageHeader product={product} />

      <EditProductForm product={product} />

      <ProductImagesPanel productId={product.id} images={productImages} />

      <AdminFormSection
        title="Variantes (precio por talle)"
        description="Disponibilidad: stock express > 0, o encargo si esta permitido. El estado se recalcula al guardar cada fila."
      >
        {variants.length === 0 ? (
          <p className="text-sm text-muted-foreground">Todavia no hay variantes. Usá el bloque de abajo para agregar un talle.</p>
        ) : (
          <div className="tcds-card overflow-hidden p-0">
            <div className="grid grid-cols-1 border-b border-border bg-surface/50 px-3 py-2 text-[10px] font-medium uppercase tracking-wide text-muted-foreground sm:px-4 dark:border-white/10 dark:bg-neutral-900/25 lg:grid-cols-12">
              <span className="hidden lg:col-span-1 lg:block">Talle</span>
              <span className="hidden lg:col-span-2 lg:block">Precio u.</span>
              <span className="hidden lg:col-span-1 lg:block">Stk. exp.</span>
              <span className="hidden lg:col-span-2 lg:block">Encargo</span>
              <span className="hidden lg:col-span-1 lg:block">Min</span>
              <span className="hidden lg:col-span-1 lg:block">Max</span>
              <span className="hidden lg:col-span-1 lg:block">Disponib.</span>
              <span className="hidden lg:col-span-2 lg:block">Accion</span>
            </div>
            {variants.map((record) => {
              const availability = resolveAvailability(record.variant);
              return (
                <VariantMatrixRow
                  key={record.variant.id}
                  productId={product.id}
                  record={record}
                  availability={availability}
                />
              );
            })}
          </div>
        )}
      </AdminFormSection>

      <AdminFormSection
        title="Agregar otra variante"
        description="Talle adicional o rango de niños. Mismas reglas de precio, stock y encargo."
      >
        <CreateVariantForm productId={product.id} embed />
      </AdminFormSection>
    </main>
  );
}
