import { notFound } from "next/navigation";
import { getCatalogProductDetail } from "@/modules/catalog/application/get-catalog-product-detail";
import { VariantSelector } from "./variant-selector";

export const dynamic = "force-dynamic";

type ProductDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function ProductDetailPage({
  params,
}: ProductDetailPageProps) {
  const { slug } = await params;
  const product = await getCatalogProductDetail(slug);

  if (!product) {
    notFound();
  }

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-6 py-10">
      <h1 className="text-2xl font-semibold">{product.title}</h1>
      <p className="text-sm text-foreground/80">
        {product.entity.name} ({product.entity.kind})
      </p>
      <p className="text-sm text-foreground/80">Era: {product.era}</p>
      <p className="rounded border bg-foreground/[0.03] p-3 text-sm text-foreground/80">
        Te mostramos tiempos reales segun stock y personalizacion.
      </p>

      <VariantSelector
        productId={product.productId}
        title={product.title}
        variants={product.variants}
        initialVariantId={product.initialVariantId}
        supportsCustomization={product.supportsCustomization}
        customizationSurcharge={product.customizationSurcharge}
      />
    </main>
  );
}
