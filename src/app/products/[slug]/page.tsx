import { notFound } from "next/navigation";
import { StorePublicFooter } from "@/components/storefront/store-public-footer";
import { StorePublicHeader } from "@/components/storefront/store-public-header";
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
    <div className="flex min-h-dvh flex-col bg-neutral-950 text-neutral-100">
      <StorePublicHeader variant="dark" />
      <main className="mx-auto w-full max-w-7xl flex-1 px-5 py-8 md:px-6 md:py-10">
        <div className="mx-auto max-w-5xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-sky-400/90">
            Producto
          </p>
          <h1 className="mt-2 text-3xl font-semibold leading-tight tracking-tight text-white md:text-4xl">
            {product.title}
          </h1>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs md:text-sm">
            <span className="rounded-full border border-white/10 bg-neutral-900/70 px-3 py-1 text-neutral-200">
              {product.productTypeLabel}
            </span>
            <span className="rounded-full border border-white/10 bg-neutral-900/70 px-3 py-1 text-neutral-300">
              {product.audienceLabel}
            </span>
            <span className="rounded-full border border-sky-500/30 bg-sky-500/10 px-3 py-1 font-medium text-sky-200">
              {product.startingPrice !== null ? `Desde $${product.startingPrice}` : "Consultar precio"}
            </span>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-neutral-400">
            Elegí talle, revisá disponibilidad real y confirmá si querés personalización antes de
            agregar al carrito.
          </p>
        </div>

        <div className="mx-auto mt-6 grid max-w-5xl gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
          <ProductPdpGallery
            key={[product.productId, ...product.images.map((img) => img.id)].join("-")}
            images={product.images}
            title={product.title}
          />

          <VariantSelector
            productId={product.productId}
            title={product.title}
            imageUrl={product.images[0]?.url ?? null}
            imageAlt={product.images[0]?.alt ?? product.title}
            variants={product.variants}
            initialVariantId={product.initialVariantId}
            supportsCustomization={product.supportsCustomization}
            customizationSurcharge={product.customizationSurcharge}
          />
        </div>
      </main>
      <StorePublicFooter variant="dark" />
    </div>
  );
}
