import Link from "next/link";
import { appConfig } from "@/lib/config";

type StorePublicFooterProps = {
  variant?: "light" | "dark";
};

export function StorePublicFooter({ variant = "light" }: StorePublicFooterProps) {
  const isDark = variant === "dark";
  const muted = isDark ? "text-neutral-500" : "text-muted-foreground";
  const link = isDark
    ? "text-neutral-400 hover:text-sky-400"
    : "text-muted-foreground hover:text-sky-600";

  return (
    <footer
      className={
        isDark
          ? "border-t border-white/10 bg-neutral-950 py-12 text-neutral-400"
          : "border-t border-border bg-surface py-10 text-muted-foreground"
      }
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-5 md:flex-row md:items-start md:justify-between md:px-6">
        <div>
          <p className={`text-sm font-semibold ${isDark ? "text-white" : "text-foreground"}`}>
            {appConfig.brandShortName}
          </p>
          <p className={`mt-2 max-w-sm text-sm ${muted}`}>
            Camisetas de fútbol y NBA. Entrega express o por encargo, con opción de personalización.
          </p>
        </div>
        <div className="flex flex-col gap-2 text-sm">
          <span className={`font-medium ${isDark ? "text-neutral-300" : "text-foreground"}`}>
            Enlaces
          </span>
          <Link href="/" className={link}>
            Inicio
          </Link>
          <Link href="/products" className={link}>
            Catálogo
          </Link>
          <Link href="/nosotros" className={link}>
            Nosotros
          </Link>
          <Link href="/cart" className={link}>
            Carrito
          </Link>
        </div>
      </div>
      <p className={`mx-auto mt-10 max-w-6xl px-5 text-center text-xs md:px-6 ${muted}`}>
        © {new Date().getFullYear()} {appConfig.brandShortName}. Todos los derechos reservados.
      </p>
    </footer>
  );
}
