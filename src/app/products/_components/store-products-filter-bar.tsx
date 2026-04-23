import Link from "next/link";

type StoreProductsFilterBarProps = {
  selectedType: "football_jersey" | "nba_jersey" | "jacket" | null;
  selectedAudience: "adult" | "kids" | null;
};

type FilterPill = {
  href: string;
  label: string;
  isActive: boolean;
};

export function StoreProductsFilterBar({
  selectedType,
  selectedAudience,
}: StoreProductsFilterBarProps) {
  const hasActiveFilter = selectedType !== null || selectedAudience !== null;

  const filters: readonly FilterPill[] = [
    { href: "/products", label: "Todos", isActive: !hasActiveFilter },
    {
      href: "/products?type=football_jersey",
      label: "Fútbol",
      isActive: selectedType === "football_jersey",
    },
    {
      href: "/products?type=nba_jersey",
      label: "NBA",
      isActive: selectedType === "nba_jersey",
    },
    {
      href: "/products?audience=kids",
      label: "Niños",
      isActive: selectedAudience === "kids",
    },
  ] as const;

  return (
    <div className="mt-6 space-y-2.5">
      <div className="flex flex-wrap items-center justify-center gap-2">
        {filters.map((filter) => (
          <Link
            key={filter.href}
            href={filter.href}
            className={`inline-flex min-h-9 items-center justify-center rounded-full px-4 text-sm font-medium transition ${
              filter.isActive
                ? "border border-sky-500/40 bg-sky-500/15 text-sky-800 shadow-sm dark:border-sky-400/45 dark:bg-sky-500/20 dark:text-sky-100 dark:shadow-sky-900/30"
                : "border border-zinc-300 bg-white text-zinc-700 hover:border-sky-400/50 hover:bg-sky-50 hover:text-sky-800 dark:border-white/10 dark:bg-neutral-900/75 dark:text-neutral-300 dark:hover:border-sky-500/35 dark:hover:bg-neutral-900 dark:hover:text-sky-200"
            }`}
          >
            {filter.label}
          </Link>
        ))}
      </div>
      {hasActiveFilter ? (
        <p className="text-center text-xs text-zinc-500 dark:text-neutral-500">
          Filtro activo.{" "}
          <Link href="/products" className="text-sky-600 hover:text-sky-700 hover:underline dark:text-sky-400 dark:hover:text-sky-300">
            Limpiar filtros
          </Link>
        </p>
      ) : null}
    </div>
  );
}
