import { appConfig } from "@/lib/config";

export function HomeTrustBar() {
  const waUrl = appConfig.storefrontWhatsappUrl;
  const items: { title: string; body: string; href?: string }[] = [
    { title: "Pagos", body: "Mercado Pago · cuotas donde aplique" },
    { title: "Envío express", body: "24–48 h en talles con stock" },
    { title: "Retiro", body: "Coordinamos retiro el mismo día" },
    waUrl
      ? { title: "WhatsApp", body: "Escribinos cuando quieras", href: waUrl }
      : { title: "WhatsApp", body: "Atención rápida por mensaje" },
  ];

  return (
    <section
      className="border-b border-white/10 bg-neutral-900/80 py-5"
      aria-label="Señales de confianza"
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-5 md:flex-row md:flex-wrap md:items-stretch md:justify-between md:gap-6 md:px-6">
        {items.map((item) => (
          <div
            key={item.title}
            className="flex min-w-0 flex-1 flex-col border-l border-sky-500/40 pl-4 md:max-w-[14rem] md:border-l-2 md:pl-5"
          >
            <span className="text-xs font-semibold uppercase tracking-wide text-sky-400">
              {item.title}
            </span>
            {item.href ? (
              <a
                href={item.href}
                className="mt-1 text-sm leading-snug text-neutral-300 underline-offset-2 hover:text-white hover:underline"
              >
                {item.body}
              </a>
            ) : (
              <p className="mt-1 text-sm leading-snug text-neutral-300">{item.body}</p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
