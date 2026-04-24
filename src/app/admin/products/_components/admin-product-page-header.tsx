import Link from "next/link";
import { adminChip } from "@/app/admin/_lib/admin-ui-classes";
import type { Product, ProductType } from "@/modules/catalog";
import { ProductActiveToggle } from "./product-active-toggle";

const productTypeLabel: Record<ProductType, string> = {
  football_jersey: "Camiseta de futbol",
  nba_jersey: "Camiseta de basquet",
  jacket: "Campera",
};

type AdminProductPageHeaderProps = {
  product: Product;
};

export function AdminProductPageHeader({ product }: AdminProductPageHeaderProps) {
  return (
    <header className="space-y-4 border-b border-border pb-6">
      <div>
        <Link className="tcds-link text-sm" href="/admin/products">
          ← Volver a productos
        </Link>
        <p className="mt-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          Editar producto
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-foreground">{product.title}</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          {productTypeLabel[product.productType]} ·{" "}
          <span className="font-mono text-xs text-foreground/80" title="Slug en URL">
            /{product.slug}
          </span>
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-2.5">
        <span
          className={`inline-flex rounded-md px-2.5 py-1 text-xs font-medium ${
            product.isActive ? adminChip.emerald : adminChip.inactive
          }`}
        >
          {product.isActive ? "Activo en tienda" : "Inactivo (no visible)"}
        </span>
        <div className="min-w-0">
          <ProductActiveToggle productId={product.id} isActive={product.isActive} />
        </div>
      </div>
    </header>
  );
}
