import Image from "next/image";
import Link from "next/link";
import { appConfig } from "@/lib/config";
import { StorefrontThemeToggle } from "./storefront-theme-toggle";

export function StorePublicHeader() {
  const navClass =
    "text-zinc-600 transition hover:text-zinc-900 dark:text-neutral-200 dark:hover:text-white";
  const barClass =
    "border-b border-zinc-200/90 bg-white/90 text-zinc-900 backdrop-blur-md dark:border-white/10 dark:bg-neutral-950/90 dark:text-neutral-100";

  return (
    <header className={`sticky top-0 z-30 ${barClass}`}>
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-4 md:h-16 md:px-6">
        <Link href="/" className="shrink-0" aria-label={`${appConfig.brandShortName} · Inicio`}>
          <Image
            src="/branding/logo-nav-light.png"
            alt={appConfig.brandShortName}
            width={200}
            height={48}
            className="h-8 w-auto md:h-9 dark:hidden"
            priority
          />
          <Image
            src="/branding/logo-nav-dark.png"
            alt=""
            width={200}
            height={48}
            className="hidden h-8 w-auto md:h-9 dark:block"
            aria-hidden
          />
        </Link>
        <nav
          className="flex items-center justify-end gap-2 text-sm font-medium sm:gap-4 md:gap-5"
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
          <StorefrontThemeToggle />
          <Link
            href="/cart"
            className="ml-0.5 whitespace-nowrap rounded-md border border-zinc-300 px-2.5 py-1.5 text-sm font-semibold text-zinc-900 transition hover:bg-zinc-100 dark:border-white/20 dark:text-white dark:hover:border-sky-400/60 dark:hover:bg-white/5 md:px-3"
          >
            Carrito
          </Link>
        </nav>
      </div>
    </header>
  );
}
