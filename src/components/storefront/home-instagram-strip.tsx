const INSTAGRAM_HREF = "https://www.instagram.com/tucasacadeportiva.uy/";

export function HomeInstagramStrip() {
  return (
    <section
      className="bg-zinc-50 dark:bg-neutral-950"
      aria-label="Compra protegida y contacto en Instagram"
    >
      <div className="mx-auto max-w-6xl px-4 py-3 md:px-6 md:py-4">
        <div className="flex flex-col gap-4 rounded-2xl border border-zinc-200 bg-linear-to-br from-white via-zinc-50 to-zinc-100 p-4 shadow-sm shadow-zinc-300/40 ring-1 ring-zinc-200/80 dark:border-white/10 dark:from-neutral-900/95 dark:via-neutral-950/95 dark:to-neutral-950/90 dark:shadow-black/30 dark:ring-white/5 sm:gap-5 sm:p-5 md:flex-row md:items-center md:justify-between md:gap-6">
          <div className="flex min-w-0 flex-1 items-start gap-3 sm:gap-4">
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-sky-200/80 bg-sky-50 text-[11px] font-bold tabular-nums tracking-wide text-sky-700 sm:h-11 sm:w-11 dark:border-white/12 dark:bg-white/[0.04] dark:text-sky-200"
              aria-hidden
            >
              TCD
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-base font-semibold leading-tight tracking-tight text-zinc-900 dark:text-white sm:text-lg">
                Compra protegida con Mercado Pago
              </h2>
              <p className="mt-1.5 text-sm leading-relaxed text-zinc-600 dark:text-neutral-400">
                Soporte por WhatsApp en minutos
              </p>
              <p className="mt-0.5 inline-flex items-center gap-1.5 text-sm leading-relaxed text-zinc-600 dark:text-neutral-500">
                <svg
                  className="h-3.5 w-3.5 shrink-0 text-zinc-500 dark:text-neutral-400"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden
                >
                  <rect x="4" y="11" width="16" height="9" rx="1.8" />
                  <path d="M8 11V8a4 4 0 0 1 8 0v3" />
                </svg>
                Pagos seguros
              </p>
            </div>
          </div>

          <div className="flex w-full min-w-0 border-t border-zinc-200 pt-3 sm:pt-4 dark:border-white/10 md:w-auto md:shrink-0 md:border-t-0 md:border-l md:border-zinc-200 md:pt-0 md:pl-6 dark:md:border-white/10">
            <a
              href={INSTAGRAM_HREF}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-auto flex min-h-11 w-full min-w-0 max-w-sm items-center justify-center rounded-lg border border-sky-500/35 bg-sky-500/15 px-4 py-2.5 text-center text-sm font-semibold text-sky-700 transition hover:border-sky-500/50 hover:bg-sky-500/20 dark:border-sky-500/25 dark:bg-sky-500/10 dark:text-sky-200 dark:hover:border-sky-400/40 dark:hover:bg-sky-500/15 sm:ml-0 sm:w-auto md:ml-auto"
            >
              Seguinos en Instagram ↗
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
