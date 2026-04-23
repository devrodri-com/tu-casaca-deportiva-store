import Link from "next/link";
import {
  FaBasketballBall,
  FaFutbol,
  FaGlobe,
  FaTshirt,
  FaWhatsapp,
} from "react-icons/fa";
import { appConfig } from "@/lib/config";
import { StorePublicFooter } from "@/components/storefront/store-public-footer";
import { StorePublicHeader } from "@/components/storefront/store-public-header";

const INSTAGRAM_URL = "https://www.instagram.com/tucasacadeportiva.uy/";

const iconBenefitClass = "mt-0.5 h-5 w-5 shrink-0 text-sky-400";
const iconKickerClass = "h-4 w-4 shrink-0 text-sky-400 md:h-[1.05rem] md:w-[1.05rem]";

export const metadata = {
  title: `Nosotros | ${appConfig.brandShortName}`,
  description: "Nuestra historia y cómo trabajamos: express, encargo y personalización.",
};

export default function NosotrosPage() {
  const whatsappUrl = appConfig.storefrontWhatsappUrl;

  return (
    <div className="flex min-h-dvh flex-col bg-neutral-950 text-neutral-100">
      <StorePublicHeader variant="dark" />
      <main className="mx-auto w-full flex-1 px-5 py-10 md:px-6 md:py-14">
        {/* Hero / historia — centrado, tono editorial */}
        <section className="mx-auto max-w-2xl text-center">
          <p className="flex flex-wrap items-center justify-center gap-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-sky-400/95 md:text-xs">
            <FaFutbol className={iconKickerClass} aria-hidden />
            <span>TU CASACA DEPORTIVA</span>
            <FaBasketballBall className={iconKickerClass} aria-hidden />
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white md:text-4xl">
            Nuestra historia
          </h1>
          <div className="mt-6 space-y-5 text-sm leading-relaxed text-neutral-300 md:text-base">
            <p>
              Tu Casaca Deportiva nació con una misión clara: llevar la pasión del fútbol y la NBA a
              cada rincón de Uruguay. Somos una tienda online especializada en casacas de calidad
              premium, retro y actuales, con diseños de temporada y modelos históricos que marcaron
              época.
            </p>
            <p>
              Cada camiseta refleja la esencia del deporte: identidad, orgullo y pertenencia.
              Apostamos por la calidad, la confianza y un servicio rápido y cercano. Desde nuestras
              redes y con el apoyo de una comunidad creciente, buscamos que cada cliente viva la
              experiencia de estrenar su casaca favorita como si estuviera entrando a la cancha.
            </p>
          </div>

          <ul className="mx-auto mt-8 max-w-md space-y-3 text-left text-sm text-neutral-200 md:text-[15px]">
            <li className="flex items-start gap-3">
              <FaGlobe className={iconBenefitClass} aria-hidden />
              <span>Envíos a todo el país</span>
            </li>
            <li className="flex items-start gap-3">
              <FaTshirt className={iconBenefitClass} aria-hidden />
              <span>Personalización disponible</span>
            </li>
            <li className="flex items-start gap-3">
              <FaWhatsapp className={iconBenefitClass} aria-hidden />
              <span>Atención por WhatsApp e Instagram</span>
            </li>
          </ul>

          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/products"
              className="inline-flex min-h-11 items-center justify-center rounded-md bg-sky-500 px-6 text-sm font-semibold text-white transition hover:bg-sky-600"
            >
              Ver tienda
            </Link>
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center justify-center rounded-md border border-white/20 px-6 text-sm font-semibold text-neutral-100 transition hover:border-sky-500/50 hover:text-sky-200"
            >
              Instagram
            </a>
          </div>
        </section>

        {/* Cómo trabajamos — compacto */}
        <section className="mx-auto mt-14 max-w-3xl border-t border-white/10 pt-12 md:mt-16 md:pt-14">
          <h2 className="text-center text-lg font-semibold text-white md:text-xl">Cómo trabajamos</h2>
          <p className="mx-auto mt-2 max-w-xl text-center text-xs text-neutral-500 md:text-sm">
            Tres modalidades que vas a ver también al comprar: claras desde el catálogo hasta el
            checkout.
          </p>
          <div className="mt-8 grid gap-6 sm:grid-cols-3 sm:gap-5">
            <div className="rounded-xl border border-white/10 bg-neutral-900/50 px-4 py-4 text-center sm:text-left">
              <p className="text-sm font-semibold text-sky-300">Stock express</p>
              <p className="mt-2 text-xs leading-relaxed text-neutral-400">
                Retiro hoy o envío en 24–48 h según disponibilidad.
              </p>
            </div>
            <div className="rounded-xl border border-white/10 bg-neutral-900/50 px-4 py-4 text-center sm:text-left">
              <p className="text-sm font-semibold text-sky-300">Pedidos por encargo</p>
              <p className="mt-2 text-xs leading-relaxed text-neutral-400">
                Cuando un talle no está en stock express, puede gestionarse por encargo con entrega
                estimada de 14–21 días.
              </p>
            </div>
            <div className="rounded-xl border border-white/10 bg-neutral-900/50 px-4 py-4 text-center sm:text-left">
              <p className="text-sm font-semibold text-sky-300">Personalización</p>
              <p className="mt-2 text-xs leading-relaxed text-neutral-400">
                Nombre y número disponibles en productos habilitados. Al personalizar, el pedido
                pasa a modalidad por encargo.
              </p>
            </div>
          </div>
        </section>

        {/* Compra y confianza — corto y discreto */}
        <section className="mx-auto mt-12 max-w-2xl border-t border-white/10 pb-4 pt-10 md:mt-14 md:pt-12">
          <h2 className="text-center text-base font-semibold text-white md:text-lg">Compra y confianza</h2>
          <ul className="mt-5 space-y-2 text-center text-sm text-neutral-300">
            <li>Pago seguro con Mercado Pago</li>
            <li>Envíos a todo Uruguay</li>
            <li>
              {whatsappUrl ? (
                <>
                  Atención por Instagram y{" "}
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sky-400 underline-offset-2 hover:underline"
                  >
                    WhatsApp
                  </a>
                </>
              ) : (
                "Atención por Instagram y WhatsApp"
              )}
            </li>
          </ul>
          <p className="mx-auto mt-8 max-w-xl text-center text-[11px] leading-relaxed text-neutral-500 md:text-xs">
            Todos nuestros productos importados de China cumplen con las normativas legales locales.
            Garantizamos una compra segura y transparente, gestionando los impuestos y aranceles
            conforme a la ley de cada país.
          </p>
        </section>
      </main>
      <StorePublicFooter variant="dark" />
    </div>
  );
}
