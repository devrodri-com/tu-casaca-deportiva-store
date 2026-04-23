import Link from "next/link";
import { appConfig } from "@/lib/config";
import { StorePublicFooter } from "@/components/storefront/store-public-footer";
import { StorePublicHeader } from "@/components/storefront/store-public-header";

export const metadata = {
  title: `Nosotros | ${appConfig.brandShortName}`,
  description: "Quiénes somos y cómo comprar en la tienda.",
};

export default function NosotrosPage() {
  return (
    <div className="flex min-h-dvh flex-col bg-neutral-950 text-neutral-100">
      <StorePublicHeader variant="dark" />
      <main className="mx-auto w-full max-w-3xl flex-1 px-5 py-12 md:px-6 md:py-16">
        <h1 className="text-3xl font-semibold tracking-tight text-white md:text-4xl">Nosotros</h1>
        <p className="mt-2 text-sky-400">{appConfig.brandShortName}</p>
        <div className="mt-8 space-y-4 text-sm leading-relaxed text-neutral-300 md:text-base">
          <p>
            Somos una tienda de camisetas de fútbol y NBA con foco en entrega clara: stock express
            cuando el talle está disponible, y pedidos por encargo cuando hace falta.
          </p>
          <p>
            Con personalización en productos habilitados, y un equipo que responde por los canales
            indicados en el sitio.
          </p>
        </div>
        <p className="mt-10 text-sm text-neutral-500">
          Esta sección se ampliará con más detalle; por ahora podés explorar el{" "}
          <Link href="/products" className="font-medium text-sky-400 hover:underline">
            catálogo
          </Link>{" "}
          o volver al{" "}
          <Link href="/" className="font-medium text-sky-400 hover:underline">
            inicio
          </Link>
          .
        </p>
      </main>
      <StorePublicFooter variant="dark" />
    </div>
  );
}
