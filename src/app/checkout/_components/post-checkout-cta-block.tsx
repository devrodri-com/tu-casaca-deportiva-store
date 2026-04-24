import Link from "next/link";
import { appConfig } from "@/lib/config";
import type { OrderDetail } from "@/modules/orders/application/get-order-detail";
import { formatOrderMoneyUruguay } from "@/modules/orders/application/order-presentation";

type PostCheckoutCtaBlockProps = {
  order: OrderDetail;
};

/**
 * Resumen y CTAs (success/pending/failure) reutilizando el mismo lenguaje que la página
 * pública de pedido, sin IDs internos.
 */
export function PostCheckoutCtaBlock({ order }: PostCheckoutCtaBlockProps) {
  const hasWhatsapp = Boolean(appConfig.storefrontWhatsappUrl);
  return (
    <>
      <div
        className="rounded-2xl border border-zinc-200 bg-white p-4 text-left text-sm text-zinc-800 ring-1 ring-zinc-200/80 dark:border-white/10 dark:bg-neutral-900/90 dark:text-neutral-200 dark:ring-white/5"
        role="region"
        aria-label="Estado de tu pago y pedido"
      >
        <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-neutral-500">
          Referencia pública
        </p>
        <p className="mt-0.5 font-mono text-base font-medium text-foreground">
          {order.publicReference}
        </p>
        <p className="mt-3 text-base font-semibold text-foreground">
          {order.statusHeadline}
        </p>
        <p className="mt-1 text-left text-sm leading-relaxed text-zinc-600 dark:text-neutral-300">
          {order.statusSubtext}
        </p>
        <p className="mt-3 text-sm text-zinc-800 dark:text-neutral-200">
          <span className="text-zinc-500 dark:text-neutral-500">Total: </span>
          {formatOrderMoneyUruguay(order.total)}
        </p>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
        <Link
          className="inline-flex w-fit min-h-10 items-center justify-center rounded-md bg-sky-500 px-4 text-sm font-semibold text-white transition hover:bg-sky-600"
          href={`/orders/${order.publicReference}`}
        >
          Ver detalle del pedido
        </Link>
        <Link
          className="tcds-link text-sm"
          href="/products"
        >
          Volver a la tienda
        </Link>
        <a
          className="tcds-link text-sm"
          href="https://www.instagram.com/tucasacadeportiva.uy/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Contacto (Instagram)
        </a>
        {hasWhatsapp ? (
          <a
            className="tcds-link text-sm"
            href={appConfig.storefrontWhatsappUrl ?? "#"}
            target="_blank"
            rel="noopener noreferrer"
          >
            WhatsApp
          </a>
        ) : null}
      </div>
    </>
  );
}
