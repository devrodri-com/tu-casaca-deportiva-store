import { NextResponse } from "next/server";
import { getPaymentsEnv } from "@/lib/env/server";
import {
  isValidMercadoPagoWebhookSignature,
  mapMercadoPagoStatusToInternal,
  parseOrderIdFromExternalReference,
} from "@/modules/payments";
import {
  claimOrderStockDiscount,
  discountExpressStockForOrderItems,
  getOrderWithItemsById,
  initializeOrderOperationalStatusAsPaid,
  rollbackOrderStockDiscountClaim,
  updateOrderPaymentState,
} from "@/modules/orders/infrastructure/order-store";

type MercadoPagoWebhookBody = {
  type?: string;
  action?: string;
  data?: {
    id?: string | number;
  };
};

type MercadoPagoPaymentResponse = {
  id: string | number;
  status: string;
  external_reference?: string | null;
  date_approved?: string | null;
};

export async function POST(request: Request) {
  const body = (await request.json()) as MercadoPagoWebhookBody;
  const url = new URL(request.url);

  const notificationId = url.searchParams.get("data.id");
  const signatureHeader = request.headers.get("x-signature");
  const requestIdHeader = request.headers.get("x-request-id");
  const env = getPaymentsEnv();

  const validSignature = isValidMercadoPagoWebhookSignature({
    signatureHeader,
    requestIdHeader,
    notificationId,
    secret: env.MERCADO_PAGO_WEBHOOK_SECRET,
  });
  if (!validSignature) {
    return NextResponse.json(
      { ok: false, message: "Webhook signature inválida." },
      { status: 401 }
    );
  }

  const eventType = body.type ?? "";
  const eventAction = body.action ?? "";
  if (eventType !== "payment" && !eventAction.includes("payment")) {
    return NextResponse.json({ ok: true, ignored: true });
  }
  if (!notificationId) {
    return NextResponse.json({ ok: true, ignored: true });
  }

  const paymentResponse = await fetch(
    `https://api.mercadopago.com/v1/payments/${notificationId}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${env.MERCADO_PAGO_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!paymentResponse.ok) {
    return NextResponse.json(
      { ok: false, message: "No se pudo consultar el pago en Mercado Pago." },
      { status: 502 }
    );
  }

  const payment = (await paymentResponse.json()) as MercadoPagoPaymentResponse;
  const orderId = parseOrderIdFromExternalReference(payment.external_reference);
  if (!orderId) {
    return NextResponse.json({ ok: true, ignored: true });
  }

  const orderWithItems = await getOrderWithItemsById(orderId);
  if (!orderWithItems) {
    return NextResponse.json({ ok: true, ignored: true });
  }

  const nextStatus = mapMercadoPagoStatusToInternal(payment.status);
  const currentStatus = orderWithItems.order.payment_status;
  if (currentStatus === "paid" && nextStatus !== "paid") {
    return NextResponse.json({ ok: true, ignored: true });
  }

  await updateOrderPaymentState({
    orderId,
    paymentStatus: nextStatus,
    mercadoPagoPaymentId: String(payment.id),
    mercadoPagoStatus: payment.status,
    paidAt: nextStatus === "paid" ? payment.date_approved ?? null : null,
  });

  if (nextStatus === "paid") {
    await initializeOrderOperationalStatusAsPaid({
      orderId,
      updatedAt: new Date().toISOString(),
    });
  }

  if (nextStatus === "paid" && !orderWithItems.order.stock_discounted_at) {
    const claimed = await claimOrderStockDiscount({
      orderId,
      discountedAt: new Date().toISOString(),
    });
    if (claimed) {
      try {
        await discountExpressStockForOrderItems(orderWithItems.items);
      } catch (error) {
        await rollbackOrderStockDiscountClaim({ orderId });
        throw error;
      }
    }
  }

  return NextResponse.json({ ok: true });
}
