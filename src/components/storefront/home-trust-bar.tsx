const TRUST_LINE_ITEMS = [
  "Cuotas con Mercado Pago",
  "Envío 24–48 h",
  "Retiro hoy",
  "WhatsApp 1–3 min",
] as const;

export function HomeTrustBar() {
  return (
    <section
      className="border-b border-white/10 bg-neutral-950/90 py-1.5 md:py-2"
      aria-label="Señales de confianza"
    >
      <div className="mx-auto max-w-6xl px-3 md:px-6">
        <div className="grid grid-cols-2 gap-px bg-white/10 sm:max-w-3xl sm:mx-auto md:max-w-none md:grid-cols-4">
          {TRUST_LINE_ITEMS.map((line) => (
            <p
              key={line}
              className="bg-neutral-950 px-2 py-1.5 text-center text-[11px] font-medium leading-tight text-neutral-300 sm:text-xs md:px-3 md:py-1.5"
            >
              {line}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}
