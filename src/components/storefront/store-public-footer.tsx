import Image from "next/image";
import Link from "next/link";
import { appConfig } from "@/lib/config";

export function StorePublicFooter() {
  const muted =
    "text-zinc-600 dark:text-neutral-400";
  const link =
    "text-zinc-600 transition hover:text-sky-600 dark:text-neutral-300 dark:hover:text-sky-300";
  const heading = "text-zinc-900 dark:text-white";
  const whatsappUrl = appConfig.storefrontWhatsappUrl;
  const socialLinks: { href: string; label: string; external?: boolean }[] = [
    {
      href: "https://www.instagram.com/tucasacadeportiva.uy/",
      label: "Instagram",
      external: true,
    },
  ];
  if (whatsappUrl) {
    socialLinks.push({ href: whatsappUrl, label: "WhatsApp", external: true });
  }

  return (
    <footer className="border-t border-sky-500/25 bg-zinc-100 py-10 text-zinc-600 dark:border-sky-500/20 dark:bg-neutral-950 dark:text-neutral-300">
      <div className="mx-auto grid max-w-6xl gap-8 px-5 md:grid-cols-[minmax(0,1.2fr)_repeat(3,minmax(0,1fr))] md:gap-6 md:px-6">
        <div className="space-y-3">
          <Link href="/" aria-label={`${appConfig.brandShortName} · Inicio`} className="inline-flex">
            <Image
              src="/branding/logo-light.png"
              alt={appConfig.brandShortName}
              width={210}
              height={50}
              className="h-8 w-auto dark:hidden"
            />
            <Image
              src="/branding/logo-dark.png"
              alt=""
              width={210}
              height={50}
              className="hidden h-8 w-auto dark:block"
              aria-hidden
            />
          </Link>
          <p className={`max-w-md text-sm leading-relaxed ${muted}`}>
            Casacas de fútbol y NBA. Entrega express o por encargo, con opción de personalización.
          </p>
        </div>
        <div className="space-y-2 text-sm">
          <p className={`font-semibold ${heading}`}>Navegación</p>
          <Link href="/" className={`${link} block w-fit`}>
            Inicio
          </Link>
          <Link href="/products" className={`${link} block w-fit`}>
            Tienda
          </Link>
          <Link href="/nosotros" className={`${link} block w-fit`}>
            Nosotros
          </Link>
          <Link href="/cart" className={`${link} block w-fit`}>
            Carrito
          </Link>
        </div>
        <div className="space-y-2 text-sm">
          <p className={`font-semibold ${heading}`}>Confianza</p>
          <p className={muted}>Pago seguro con Mercado Pago</p>
          <p className={muted}>Envíos a todo Uruguay</p>
          <p className={muted}>Personalización disponible</p>
        </div>
        <div className="space-y-2 text-sm">
          <p className={`font-semibold ${heading}`}>Contacto</p>
          {socialLinks.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className={`${link} block w-fit`}
              target={item.external ? "_blank" : undefined}
              rel={item.external ? "noopener noreferrer" : undefined}
            >
              {item.label}
            </a>
          ))}
        </div>
      </div>
      <p
        className="mx-auto mt-8 max-w-6xl border-t border-sky-500/25 px-5 pt-4 text-center text-xs text-zinc-500 dark:border-sky-500/20 dark:text-neutral-500 md:px-6"
      >
        © 2026 Tu Casaca Deportiva. Todos los derechos reservados. · Hecho con Next.js por{" "}
        <a
          href="https://www.devrodri.com"
          target="_blank"
          rel="noreferrer"
          className="text-zinc-600 hover:text-zinc-800 dark:text-neutral-400 dark:hover:text-neutral-300"
        >
          Rodrigo Opalo
        </a>
      </p>
    </footer>
  );
}
