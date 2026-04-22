import { NextResponse } from "next/server";
import { getPaymentsEnv } from "@/lib/env/server";
import {
  buildMercadoPagoPreferencePayload,
  parseOrderIdFromExternalReference,
} from "@/modules/payments";
import {
  getOrderWithItemsById,
  updateOrderMercadoPagoPreferenceId,
} from "@/modules/orders/infrastructure/order-store";

type PreferenceBody = {
  orderId: string;
};

type MercadoPagoPreferenceResponse = {
  id: string;
  init_point: string | null;
  sandbox_init_point: string | null;
  external_reference: string | null;
};

export async function POST(request: Request) {
  const body = (await request.json()) as PreferenceBody;
  const orderId = body.orderId?.trim();
  if (!orderId) {
    return NextResponse.json(
      { ok: false, message: "orderId es requerido." },
      { status: 400 }
    );
  }

  const orderWithItems = await getOrderWithItemsById(orderId);
  if (!orderWithItems) {
    return NextResponse.json(
      { ok: false, message: "Orden no encontrada." },
      { status: 404 }
    );
  }
  if (orderWithItems.order.payment_status === "paid") {
    return NextResponse.json(
      { ok: false, message: "La orden ya está pagada." },
      { status: 400 }
    );
  }

  const env = getPaymentsEnv();
  const payload = buildMercadoPagoPreferencePayload({
    order: orderWithItems.order,
    items: orderWithItems.items,
    appUrl: env.APP_URL,
  });

  const mpResponse = await fetch(
    "https://api.mercadopago.com/checkout/preferences",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.MERCADO_PAGO_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }
  );

  if (!mpResponse.ok) {
    const errorText = await mpResponse.text();
    return NextResponse.json(
      { ok: false, message: `Error creando preferencia: ${errorText}` },
      { status: 502 }
    );
  }

  const preference =
    (await mpResponse.json()) as MercadoPagoPreferenceResponse;
  if (!preference.id) {
    return NextResponse.json(
      { ok: false, message: "Respuesta inválida de Mercado Pago." },
      { status: 502 }
    );
  }

  const referencedOrderId = parseOrderIdFromExternalReference(
    preference.external_reference
  );
  if (referencedOrderId !== orderId) {
    return NextResponse.json(
      { ok: false, message: "external_reference inválido." },
      { status: 502 }
    );
  }

  await updateOrderMercadoPagoPreferenceId({
    orderId,
    preferenceId: preference.id,
  });

  const redirectUrl = preference.init_point ?? preference.sandbox_init_point;
  if (!redirectUrl) {
    return NextResponse.json(
      { ok: false, message: "Mercado Pago no devolvió URL de pago." },
      { status: 502 }
    );
  }

  return NextResponse.json({ ok: true, redirectUrl });
}
