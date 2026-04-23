const INSTAGRAM_HREF = "https://www.instagram.com/tucasacadeportiva.uy/";

export function HomeInstagramStrip() {
  return (
    <section
      className="bg-neutral-950"
      aria-label="Compra protegida y contacto en Instagram"
    >
      <div className="mx-auto max-w-6xl px-4 py-3 md:px-6 md:py-4">
        <div className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-linear-to-br from-neutral-900/95 via-neutral-950/95 to-neutral-950/90 p-4 shadow-sm shadow-black/30 ring-1 ring-white/5 sm:gap-5 sm:p-5 md:flex-row md:items-center md:justify-between md:gap-6">
          <div className="flex min-w-0 flex-1 items-start gap-3 sm:gap-4">
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-white/12 bg-white/[0.04] text-[11px] font-bold tabular-nums tracking-wide text-sky-200 sm:h-11 sm:w-11"
              aria-hidden
            >
              TCD
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-base font-semibold leading-tight tracking-tight text-white sm:text-lg">
                Compra protegida con Mercado Pago
              </h2>
              <p className="mt-1.5 text-sm leading-relaxed text-neutral-400">
                Soporte por WhatsApp en minutos
              </p>
              <p className="mt-0.5 inline-flex items-center gap-1.5 text-sm leading-relaxed text-neutral-500">
                <svg
                  className="h-3.5 w-3.5 shrink-0 text-neutral-400"
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

          <div className="flex w-full min-w-0 border-t border-white/10 pt-3 sm:pt-4 md:w-auto md:shrink-0 md:border-t-0 md:border-l md:pt-0 md:pl-6">
            <a
              href={INSTAGRAM_HREF}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-auto flex min-h-11 w-full min-w-0 max-w-sm items-center justify-center rounded-lg border border-sky-500/25 bg-sky-500/10 px-4 py-2.5 text-center text-sm font-semibold text-sky-200 transition hover:border-sky-400/40 hover:bg-sky-500/15 sm:ml-0 sm:w-auto md:ml-auto"
            >
              Seguinos en Instagram ↗
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
