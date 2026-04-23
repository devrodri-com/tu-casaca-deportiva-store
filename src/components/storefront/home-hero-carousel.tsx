"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

const AUTOPLAY_MS = 5500;

const SLIDES = [
  {
    id: "futbol",
    image: "/home/hero-football.jpg",
    kicker: "Colección fútbol",
    title: "Clubes y selecciones",
    sub: "Entrega en stock express 24–48 h cuando el talle está disponible.",
    cta: { href: "/products?type=football_jersey" as const, label: "Ver fútbol" },
  },
  {
    id: "nba",
    image: "/home/hero-nba.jpg",
    kicker: "NBA",
    title: "Franquicias y estilo pro",
    sub: "Pedidos por encargo cuando hace falta. Talles oficiales.",
    cta: { href: "/products?type=nba_jersey" as const, label: "Ver NBA" },
  },
  {
    id: "ninos",
    image: "/home/hero-kids.jpg",
    kicker: "Niños",
    title: "Talles y equipos para chicos",
    sub: "Misma calidad, pensado para el público infantil.",
    cta: { href: "/products?audience=kids" as const, label: "Ver niños" },
  },
] as const;

export function HomeHeroCarousel() {
  const [index, setIndex] = useState(0);

  const go = useCallback((i: number) => {
    setIndex(((i % SLIDES.length) + SLIDES.length) % SLIDES.length);
  }, []);

  useEffect(() => {
    const id = window.setInterval(() => {
      setIndex((prev) => (prev + 1) % SLIDES.length);
    }, AUTOPLAY_MS);
    return () => window.clearInterval(id);
  }, []);

  return (
    <section
      className="relative border-b border-zinc-200 dark:border-white/10"
      role="region"
      aria-label="Carrusel principal"
      aria-roledescription="carrusel"
    >
      <h1 className="sr-only">Tu Casaca Deportiva · Inicio</h1>
      <div className="relative h-[min(78vh,640px)] w-full overflow-hidden bg-zinc-100 dark:bg-neutral-950">
        {SLIDES.map((slide, i) => {
          const isActive = i === index;
          return (
            <div
              key={slide.id}
              inert={!isActive}
              className={`absolute inset-0 transition-opacity duration-700 ease-out ${
                isActive ? "z-10 opacity-100" : "z-0 pointer-events-none opacity-0"
              }`}
              aria-hidden={!isActive}
            >
              <Image
                src={slide.image}
                alt=""
                fill
                priority={i === 0}
                className="object-cover object-center"
                sizes="100vw"
              />
              <div
                className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/25"
                aria-hidden
              />
              <div className="absolute inset-0 z-10 flex flex-col items-start justify-end px-5 pb-24 pt-20 md:px-8 md:pb-28 lg:mx-auto lg:max-w-6xl lg:px-6">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-400">
                  {slide.kicker}
                </p>
                <p className="mt-2 max-w-2xl text-3xl font-semibold leading-tight tracking-tight text-white sm:text-4xl md:text-5xl">
                  {slide.title}
                </p>
                <p className="mt-3 max-w-xl text-sm leading-relaxed text-neutral-200 sm:text-base">
                  {slide.sub}
                </p>
                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <Link
                    href={slide.cta.href}
                    className="inline-flex min-h-[2.75rem] items-center justify-center rounded-md bg-sky-500 px-5 text-sm font-semibold text-white shadow-lg shadow-sky-900/30 transition hover:bg-sky-600 focus-visible:outline focus-visible:ring-2 focus-visible:ring-sky-300"
                  >
                    {slide.cta.label}
                  </Link>
                  <Link
                    href="/products"
                    className="inline-flex min-h-[2.75rem] items-center justify-center rounded-md border border-white/30 bg-white/10 px-4 text-sm font-semibold text-white backdrop-blur-sm transition hover:border-white/50"
                  >
                    Toda la tienda
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div
        className="absolute bottom-0 left-0 right-0 z-20 flex items-center justify-center gap-2 pb-4 md:pb-5"
        role="tablist"
        aria-label="Elegir slide"
      >
        {SLIDES.map((s, i) => (
          <button
            key={s.id}
            type="button"
            role="tab"
            aria-selected={i === index}
            aria-label={`${s.kicker}: ${s.title}`}
            className={`h-2.5 rounded-full transition-all ${
              i === index
                ? "w-8 bg-sky-400"
                : "w-2.5 bg-white/40 hover:bg-white/60"
            }`}
            onClick={() => go(i)}
          />
        ))}
      </div>
    </section>
  );
}
