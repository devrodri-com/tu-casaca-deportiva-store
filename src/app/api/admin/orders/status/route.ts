import { NextResponse } from "next/server";
import {
  applyOrderOperationalStatusChangeWithHistory,
  getOrderWithItemsById,
} from "@/modules/orders/infrastructure/order-store";

type OperationalStatus =
  | "paid"
  | "preparing"
  | "ready"
  | "shipped"
  | "delivered"
  | "cancelled";

const ALLOWED_STATUSES: OperationalStatus[] = [
  "paid",
  "preparing",
  "ready",
  "shipped",
  "delivered",
  "cancelled",
];

const ORDERED_FLOW: OperationalStatus[] = [
  "paid",
  "preparing",
  "ready",
  "shipped",
  "delivered",
];

function isValidTransition(
  current: OperationalStatus | null,
  next: OperationalStatus
): boolean {
  if (current === "cancelled" || current === "delivered") {
    return false;
  }
  if (next === "cancelled") {
    return true;
  }
  if (current === null) {
    return next === "paid";
  }

  const currentIndex = ORDERED_FLOW.indexOf(current);
  const nextIndex = ORDERED_FLOW.indexOf(next);
  if (currentIndex === -1 || nextIndex === -1) {
    return false;
  }
  return nextIndex === currentIndex + 1;
}

export async function POST(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";
  let orderId = "";
  let nextOperationalStatus: OperationalStatus | undefined;

  if (contentType.includes("application/json")) {
    const body = (await request.json()) as {
      orderId?: string;
      nextOperationalStatus?: string;
    };
    orderId = body.orderId?.trim() ?? "";
    nextOperationalStatus = body.nextOperationalStatus as
      | OperationalStatus
      | undefined;
  } else {
    const formData = await request.formData();
    orderId = String(formData.get("orderId") ?? "").trim();
    nextOperationalStatus = String(
      formData.get("nextOperationalStatus") ?? ""
    ) as OperationalStatus;
  }

  if (!orderId || !nextOperationalStatus || !ALLOWED_STATUSES.includes(nextOperationalStatus)) {
    return NextResponse.json(
      { ok: false, message: "orderId y nextOperationalStatus válidos son requeridos." },
      { status: 400 }
    );
  }

  const order = await getOrderWithItemsById(orderId);
  if (!order) {
    return NextResponse.json(
      { ok: false, message: "Pedido no encontrado." },
      { status: 404 }
    );
  }
  if (order.order.payment_status !== "paid") {
    return NextResponse.json(
      { ok: false, message: "No se puede operar un pedido no pagado." },
      { status: 400 }
    );
  }
  if (!isValidTransition(order.order.operational_status, nextOperationalStatus)) {
    return NextResponse.json(
      { ok: false, message: "Transición operativa inválida." },
      { status: 400 }
    );
  }

  await applyOrderOperationalStatusChangeWithHistory({
    orderId,
    previousStatus: order.order.operational_status,
    previousUpdatedAt: order.order.operational_updated_at,
    nextStatus: nextOperationalStatus,
    changedAt: new Date().toISOString(),
    changedBy: null,
    expectedCurrentStatus: order.order.operational_status,
  });

  if (!contentType.includes("application/json")) {
    return NextResponse.redirect(new URL("/admin/orders", request.url), 303);
  }
  return NextResponse.json({ ok: true });
}
