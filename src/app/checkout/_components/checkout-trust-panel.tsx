import { appConfig } from "@/lib/config";

export function CheckoutTrustPanel() {
  return (
    <div className="rounded-2xl border border-sky-200 bg-sky-50 p-4 dark:border-sky-500/20 dark:bg-sky-950/20">
      <p className="text-sm font-semibold text-sky-900 dark:text-sky-200">Compra protegida y proceso claro</p>
      <ul className="mt-2 space-y-1.5 text-xs leading-relaxed text-sky-900/90 dark:text-sky-100/90">
        <li>Pago seguro a través de Mercado Pago.</li>
        <li>Antes de pagar podés revisar tu pedido completo.</li>
        <li>Los tiempos de entrega dependen de si la línea es express o por encargo.</li>
        {appConfig.storefrontWhatsappUrl ? (
          <li>
            Atención por WhatsApp:{" "}
            <a
              href={appConfig.storefrontWhatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-sky-700 underline-offset-2 hover:underline dark:text-sky-300"
            >
              resolver una duda antes de pagar
            </a>
            .
          </li>
        ) : null}
      </ul>
    </div>
  );
}
