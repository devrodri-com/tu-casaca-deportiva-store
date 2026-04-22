import { notFound } from "next/navigation";
import { getCatalogProductDetail } from "@/modules/catalog/application/get-catalog-product-detail";
import { ProductPdpGallery } from "./product-pdp-gallery";
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
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-5 px-6 py-8 md:py-10">
      <h1 className="tcds-title-page leading-tight md:text-3xl">{product.title}</h1>

      <ProductPdpGallery
        key={[product.productId, ...product.images.map((img) => img.id)].join("-")}
        images={product.images}
        title={product.title}
      />

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
