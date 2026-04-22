import { createHmac, timingSafeEqual } from "node:crypto";
import type { Database } from "@/lib/supabase/database.types";

type OrderRow = Database["public"]["Tables"]["orders"]["Row"];
type OrderItemRow = Database["public"]["Tables"]["order_items"]["Row"];

export type InternalPaymentStatus =
  | "awaiting_payment"
  | "pending"
  | "paid"
  | "failed";

export function buildMercadoPagoPreferencePayload(params: {
  order: OrderRow;
  items: OrderItemRow[];
  appUrl: string;
}): Record<string, unknown> {
  const { order, items, appUrl } = params;
  return {
    items: items.map((item) => ({
      title: item.title_snapshot,
      quantity: item.quantity,
      unit_price: Number(item.unit_price_snapshot),
      currency_id: "ARS",
    })),
    external_reference: `order:${order.id}`,
    notification_url: `${appUrl}/api/payments/mercadopago/webhook`,
    back_urls: {
      success: `${appUrl}/checkout/success?orderId=${order.id}`,
      pending: `${appUrl}/checkout/pending?orderId=${order.id}`,
      failure: `${appUrl}/checkout/failure?orderId=${order.id}`,
    },
    auto_return: "approved",
    payer: order.customer_email ? { email: order.customer_email } : undefined,
  };
}

export function parseOrderIdFromExternalReference(
  externalReference: string | null | undefined
): string | null {
  if (!externalReference || !externalReference.startsWith("order:")) {
    return null;
  }
  const orderId = externalReference.slice("order:".length).trim();
  return orderId.length > 0 ? orderId : null;
}

export function mapMercadoPagoStatusToInternal(
  mercadoPagoStatus: string
): InternalPaymentStatus {
  if (mercadoPagoStatus === "approved") {
    return "paid";
  }
  if (mercadoPagoStatus === "pending" || mercadoPagoStatus === "in_process") {
    return "pending";
  }
  if (mercadoPagoStatus === "rejected" || mercadoPagoStatus === "cancelled") {
    return "failed";
  }
  return "awaiting_payment";
}

export function isValidMercadoPagoWebhookSignature(params: {
  signatureHeader: string | null;
  requestIdHeader: string | null;
  notificationId: string | null;
  secret: string;
}): boolean {
  const { signatureHeader, requestIdHeader, notificationId, secret } = params;
  if (!signatureHeader || !requestIdHeader || !notificationId) {
    return false;
  }

  const fragments = signatureHeader.split(",").map((part) => part.trim());
  const tsFragment = fragments.find((fragment) => fragment.startsWith("ts="));
  const v1Fragment = fragments.find((fragment) => fragment.startsWith("v1="));
  if (!tsFragment || !v1Fragment) {
    return false;
  }

  const timestamp = tsFragment.slice(3);
  const signature = v1Fragment.slice(3).toLowerCase();
  const normalizedNotificationId = notificationId.toLowerCase();
  if (!timestamp || !signature) {
    return false;
  }

  const manifest = `id:${normalizedNotificationId};request-id:${requestIdHeader};ts:${timestamp};`;
  const expected = createHmac("sha256", secret)
    .update(manifest)
    .digest("hex")
    .toLowerCase();

  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  if (signatureBuffer.length !== expectedBuffer.length) {
    return false;
  }
  return timingSafeEqual(signatureBuffer, expectedBuffer);
}
