import Link from "next/link";
import { appConfig } from "@/lib/config";

type StorePublicHeaderProps = {
  variant?: "light" | "dark";
};

export function StorePublicHeader({ variant = "light" }: StorePublicHeaderProps) {
  const isDark = variant === "dark";
  const navClass = isDark
    ? "text-neutral-200 hover:text-white"
    : "text-muted-foreground hover:text-foreground";
  const logoClass = isDark ? "text-white" : "text-foreground";
  const barClass = isDark
    ? "border-b border-white/10 bg-neutral-950/90 text-neutral-100 backdrop-blur-md"
    : "border-b border-border bg-white/90 text-foreground backdrop-blur-md";

  return (
    <header className={`sticky top-0 z-30 ${barClass}`}>
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-5 md:h-16 md:px-6">
        <Link
          href="/"
          className={`text-base font-semibold tracking-tight md:text-lg ${logoClass}`}
        >
          {appConfig.brandShortName}
        </Link>
        <nav className="flex items-center gap-5 text-sm font-medium md:gap-7" aria-label="Tienda">
          <Link href="/products" className={navClass}>
            Tienda
          </Link>
          <Link href="/products?type=football_jersey" className={`hidden sm:inline ${navClass}`}>
            Fútbol
          </Link>
          <Link href="/products?type=nba_jersey" className={`hidden sm:inline ${navClass}`}>
            NBA
          </Link>
          <Link href="/products?audience=kids" className={`hidden sm:inline ${navClass}`}>
            Niños
          </Link>
          <Link
            href="/cart"
            className={`rounded-md border px-3 py-1.5 text-sm font-semibold transition ${
              isDark
                ? "border-white/20 text-white hover:border-sky-400/60 hover:bg-white/5"
                : "border-border text-foreground hover:bg-surface"
            }`}
          >
            Carrito
          </Link>
        </nav>
      </div>
    </header>
  );
}
