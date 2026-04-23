import Link from "next/link";
import type { IconType } from "react-icons";
import { FaGlobe, FaTshirt, FaWhatsapp } from "react-icons/fa";

type BulletItem = {
  id: "ship" | "custom" | "channels";
  text: string;
  Icon: IconType;
};

const BULLETS: readonly BulletItem[] = [
  { id: "ship", text: "Envíos a todo el país", Icon: FaGlobe },
  { id: "custom", text: "Personalización disponible", Icon: FaTshirt },
  { id: "channels", text: "Atención por WhatsApp e Instagram", Icon: FaWhatsapp },
] as const;

export function HomeInstitutionalBlock() {
  return (
    <section
      className="bg-neutral-950 pt-16 pb-16 md:pt-20 md:pb-20"
      aria-labelledby="home-institutional-heading"
    >
      <div className="mx-auto max-w-2xl px-5 text-center md:px-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-sky-400/90">
          TU CASACA DEPORTIVA
        </p>
        <h2
          id="home-institutional-heading"
          className="mt-4 text-3xl font-semibold leading-tight tracking-tight text-white sm:text-4xl"
        >
          Casacas de Fútbol y NBA
        </h2>
        <p className="mt-5 text-left text-sm leading-relaxed text-neutral-300 sm:text-center md:text-base">
          En Tu Casaca Deportiva ofrecemos casacas de calidad premium - temporada 25/26 y también
          camisetas retro de todas las épocas. Envíos a todo Uruguay y atención personalizada por
          WhatsApp.
        </p>
        <ul
          className="mx-auto mt-8 max-w-md space-y-3.5 text-left sm:max-w-sm"
          role="list"
        >
          {BULLETS.map(({ id, text, Icon }) => (
            <li key={id} className="flex items-center gap-2.5">
              <span className="inline-flex h-4 w-4 items-center justify-center" aria-hidden>
                <Icon className="h-4 w-4 text-[#3B82F6]" />
              </span>
              <span className="text-sm leading-relaxed text-neutral-200 md:text-base">{text}</span>
            </li>
          ))}
        </ul>
        <div className="mt-10">
          <Link
            href="/nosotros"
            className="inline-flex min-h-11 items-center justify-center rounded-md bg-sky-500 px-6 text-sm font-semibold text-white shadow-lg shadow-sky-900/30 transition hover:bg-sky-600 focus-visible:outline focus-visible:ring-2 focus-visible:ring-sky-300"
          >
            Conocé más sobre nosotros
          </Link>
        </div>
      </div>
    </section>
  );
}
