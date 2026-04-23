import { HomeCategoryGrid } from "@/components/storefront/home-category-grid";
import { HomeFeaturedProducts } from "@/components/storefront/home-featured-products";
import { HomeHeroCarousel } from "@/components/storefront/home-hero-carousel";
import { HomeTrustBar } from "@/components/storefront/home-trust-bar";
import { StorePublicFooter } from "@/components/storefront/store-public-footer";
import { StorePublicHeader } from "@/components/storefront/store-public-header";
import { getCatalogProductList } from "@/modules/catalog/application/get-catalog-product-list";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const catalog = await getCatalogProductList();
  const featured = catalog.slice(0, 6);

  return (
    <div className="flex min-h-dvh flex-col bg-neutral-950 text-neutral-100">
      <StorePublicHeader variant="dark" />
      <HomeHeroCarousel />
      <HomeTrustBar />
      <HomeCategoryGrid />
      <HomeFeaturedProducts items={featured} />
      <div className="flex-1" aria-hidden />
      <StorePublicFooter variant="dark" />
    </div>
  );
}
