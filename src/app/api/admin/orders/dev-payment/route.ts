import { NextResponse } from "next/server";
import {
  applyOrderOperationalStatusChangeWithHistory,
  discountOrderExpressStockAtomic,
  getOrderWithItemsById,
  updateOrderPaymentState,
} from "@/modules/orders/infrastructure/order-store";

type NextPaymentStatus = "pending" | "paid" | "failed";

type ParsedBody = {
  orderId: string;
  nextPaymentStatus: NextPaymentStatus;
  isFormData: boolean;
};

function jsonError(message: string, status: number) {
  return NextResponse.json({ ok: false, message }, { status });
}

function redirectAdminOrders(request: Request) {
  return NextResponse.redirect(new URL("/admin/orders", request.url));
}

function isAllowedNextPaymentStatus(value: string): value is NextPaymentStatus {
  return value === "pending" || value === "paid" || value === "failed";
}

async function parseDevPaymentBody(request: Request): Promise<ParsedBody> {
  const contentType = request.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    const raw = (await request.json()) as unknown;
    if (typeof raw !== "object" || raw === null || Array.isArray(raw)) {
      throw new Error("Body JSON inválido.");
    }
    const obj = raw as Record<string, unknown>;
    const orderId = typeof obj.orderId === "string" ? obj.orderId.trim() : "";
    const nextPaymentStatus =
      typeof obj.nextPaymentStatus === "string" ? obj.nextPaymentStatus : "";
    if (orderId.length === 0) {
      throw new Error("orderId es requerido.");
    }
    if (!isAllowedNextPaymentStatus(nextPaymentStatus)) {
      throw new Error("nextPaymentStatus inválido.");
    }
    return { orderId, nextPaymentStatus, isFormData: false };
  }

  const form = await request.formData();
  const orderId = String(form.get("orderId") ?? "").trim();
  const nextPaymentStatus = String(form.get("nextPaymentStatus") ?? "");
  if (orderId.length === 0) {
    throw new Error("orderId es requerido.");
  }
  if (!isAllowedNextPaymentStatus(nextPaymentStatus)) {
    throw new Error("nextPaymentStatus inválido.");
  }
  return { orderId, nextPaymentStatus, isFormData: true };
}

export async function POST(request: Request) {
  if (process.env.NODE_ENV !== "development") {
    return jsonError("Not Found", 404);
  }

  const isJsonRequest =
    (request.headers.get("content-type") ?? "").includes("application/json");

  let parsed: ParsedBody;
  try {
    parsed = await parseDevPaymentBody(request);
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "No se pudo leer el body de la simulación.";
    if (!isJsonRequest) {
      return redirectAdminOrders(request);
    }
    return jsonError(message, 400);
  }

  try {
    const found = await getOrderWithItemsById(parsed.orderId);
    if (!found) {
      if (parsed.isFormData) {
        return redirectAdminOrders(request);
      }
      return jsonError("Pedido no encontrado.", 404);
    }

    const currentPaymentStatus = found.order.payment_status;
    if (
      currentPaymentStatus === "paid" &&
      (parsed.nextPaymentStatus === "pending" ||
        parsed.nextPaymentStatus === "failed")
    ) {
      if (parsed.isFormData) {
        return redirectAdminOrders(request);
      }
      return jsonError(
        "No se puede degradar un pedido ya pagado a pending/failed.",
        400
      );
    }

    const nowIso = new Date().toISOString();
    const devPaymentId = `dev-sim:${Date.now()}`;

    if (parsed.nextPaymentStatus === "paid") {
      // V1: primero se marca pago (igual que webhook real) y luego se intenta descuento.
      // Si falla la RPC de stock, el pedido queda paid con stock pendiente para atención operativa.
      await updateOrderPaymentState({
        orderId: parsed.orderId,
        paymentStatus: "paid",
        mercadoPagoPaymentId: devPaymentId,
        mercadoPagoStatus: "approved",
        paidAt: nowIso,
      });
      await applyOrderOperationalStatusChangeWithHistory({
        orderId: parsed.orderId,
        previousStatus: null,
        previousUpdatedAt: null,
        nextStatus: "paid",
        changedAt: nowIso,
        changedBy: "dev-payment-sim",
        expectedCurrentStatus: null,
      });
      await discountOrderExpressStockAtomic({
        orderId: parsed.orderId,
        discountedAt: nowIso,
      });
    } else if (parsed.nextPaymentStatus === "pending") {
      await updateOrderPaymentState({
        orderId: parsed.orderId,
        paymentStatus: "pending",
        mercadoPagoPaymentId: devPaymentId,
        mercadoPagoStatus: "pending",
        paidAt: null,
      });
    } else {
      await updateOrderPaymentState({
        orderId: parsed.orderId,
        paymentStatus: "failed",
        mercadoPagoPaymentId: devPaymentId,
        mercadoPagoStatus: "rejected",
        paidAt: null,
      });
    }
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Falló la simulación de pago en desarrollo.";
    if (parsed.isFormData) {
      return redirectAdminOrders(request);
    }
    return jsonError(message, 400);
  }

  if (parsed.isFormData) {
    return redirectAdminOrders(request);
  }
  return NextResponse.json({ ok: true });
}
