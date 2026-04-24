import Link from "next/link";
import { appConfig } from "@/lib/config";
import type { OrderDetail } from "@/modules/orders/application/get-order-detail";
import { formatOrderMoneyUruguay } from "@/modules/orders/application/order-presentation";

type PublicOrderPageProps = {
  order: OrderDetail;
};

export function PublicOrderPage({ order }: PublicOrderPageProps) {
  const hasWhatsapp = Boolean(appConfig.storefrontWhatsappUrl);

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-6 py-10">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-neutral-500">
          Tu pedido
        </p>
        <h1 className="tcds-title-page mt-1">Referencia: {order.publicReference}</h1>
        <p className="tcds-prose mt-2 max-w-2xl">
          Guardá esta referencia: la vas a pedir en cualquier seguimiento con el equipo.
        </p>
      </div>

      <section
        className="tcds-card p-4 md:p-5"
        aria-labelledby="estado-pago-heading"
      >
        <h2
          id="estado-pago-heading"
          className="text-base font-semibold text-foreground"
        >
          {order.statusHeadline}
        </h2>
        <p className="tcds-prose mt-2">{order.statusSubtext}</p>
        {order.followUpLine ? <p className="tcds-prose mt-2">{order.followUpLine}</p> : null}
        {order.operationalMessage ? (
          <p className="mt-3 rounded-md border border-border bg-surface/50 px-3 py-2 text-sm text-foreground dark:border-white/10">
            {order.operationalMessage}
          </p>
        ) : null}
        <p className="mt-4 text-sm font-medium text-foreground">
          Total: {formatOrderMoneyUruguay(order.total)}
        </p>
      </section>

      <section aria-labelledby="lineas-pedido-heading">
        <h2
          id="lineas-pedido-heading"
          className="text-sm font-semibold uppercase tracking-wider text-muted-foreground"
        >
          Líneas del pedido
        </h2>
        <ul className="mt-3 flex flex-col gap-3">
          {order.items.map((line, index) => (
            <li
              key={`${order.publicReference}-line-${index}`}
              className="tcds-card p-4 text-sm"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="font-medium text-foreground">{line.productTitle}</h3>
                <span className="shrink-0 text-muted-foreground">Talle {line.sizeLabel}</span>
              </div>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {line.fulfillmentKind} - {line.deliveryLine}
              </p>
              {line.customizationLine ? (
                <p className="mt-2 text-sm text-foreground">{line.customizationLine}</p>
              ) : null}
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3 text-sm dark:border-white/10">
                <span className="text-muted-foreground">Cant. {line.quantity}</span>
                <span>
                  {formatOrderMoneyUruguay(line.unitPrice)} c/u ={" "}
                  <span className="font-medium text-foreground">
                    {formatOrderMoneyUruguay(line.lineTotal)}
                  </span>
                </span>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
        <Link className="tcds-btn-primary inline-flex w-fit" href="/products">
          Volver a la tienda
        </Link>
        <a
          href="https://www.instagram.com/tucasacadeportiva.uy/"
          className="tcds-link text-sm"
          target="_blank"
          rel="noopener noreferrer"
        >
          Escribir por Instagram
        </a>
        {hasWhatsapp ? (
          <a
            href={appConfig.storefrontWhatsappUrl ?? "#"}
            className="tcds-link text-sm"
            target="_blank"
            rel="noopener noreferrer"
          >
            Escribir por WhatsApp
          </a>
        ) : null}
      </div>
    </main>
  );
}
