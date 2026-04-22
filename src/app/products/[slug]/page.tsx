import { notFound } from "next/navigation";
import { getCatalogProductDetail } from "@/modules/catalog/application/get-catalog-product-detail";

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
        entity: {product.entity.name} ({product.entity.kind})
      </p>
      <p className="text-sm text-foreground/80">era: {product.era}</p>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-medium">Variantes</h2>
        {product.variants.length === 0 ? (
          <p className="text-sm text-foreground/80">Sin variantes.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {product.variants.map((variant) => (
              <li key={variant.id} className="rounded border p-3 text-sm">
                <p>size: {variant.size}</p>
                <p>availability: {variant.availability}</p>
                <p>fulfillment: {variant.fulfillment}</p>
                <p>
                  promisedDays: {String(variant.promisedDays.minDays)} /{" "}
                  {String(variant.promisedDays.maxDays)}
                </p>
                <p>finalUnitPrice: {variant.finalUnitPrice}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
