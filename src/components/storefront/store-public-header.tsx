import Image from "next/image";
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
  const barClass = isDark
    ? "border-b border-white/10 bg-neutral-950/90 text-neutral-100 backdrop-blur-md"
    : "border-b border-border bg-white/90 text-foreground backdrop-blur-md";
  const logoSrc = isDark
    ? "/branding/logo-nav-dark.png"
    : "/branding/logo-nav-light.png";

  return (
    <header className={`sticky top-0 z-30 ${barClass}`}>
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-4 md:h-16 md:px-6">
        <Link href="/" className="shrink-0" aria-label={`${appConfig.brandShortName} · Inicio`}>
          <Image
            src={logoSrc}
            alt={appConfig.brandShortName}
            width={200}
            height={48}
            className="h-8 w-auto md:h-9"
            priority
          />
        </Link>
        <nav
          className="flex items-center justify-end gap-3 text-sm font-medium sm:gap-5 md:gap-6"
          aria-label="Principal"
        >
          <Link href="/" className={`whitespace-nowrap ${navClass}`}>
            Inicio
          </Link>
          <Link href="/products" className={`whitespace-nowrap ${navClass}`}>
            Tienda
          </Link>
          <Link href="/nosotros" className={`whitespace-nowrap ${navClass}`}>
            Nosotros
          </Link>
          <Link
            href="/cart"
            className={`ml-0.5 whitespace-nowrap rounded-md border px-2.5 py-1.5 text-sm font-semibold transition md:px-3 ${
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
