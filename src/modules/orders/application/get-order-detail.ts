import {
  getOrderWithItemsById,
  getOrderWithItemsByPublicReference,
} from "@/modules/orders/infrastructure/order-store";
import type { Database } from "@/lib/supabase/database.types";

type PaymentStatus = "awaiting_payment" | "pending" | "paid" | "failed";
type OrderRow = Database["public"]["Tables"]["orders"]["Row"];
type OrderItemRow = Database["public"]["Tables"]["order_items"]["Row"];

export type OrderDetailItem = {
  title: string;
  quantity: number;
  customization: string;
  fulfillment: "express" | "made_to_order" | "unavailable";
  promisedDays: {
    minDays: number | null;
    maxDays: number | null;
  };
  unitPrice: number;
  lineTotal: number;
};

export type OrderDetail = {
  orderId: string;
  publicReference: string;
  paymentStatus: PaymentStatus;
  paymentStatusLabel: string;
  total: number;
  items: OrderDetailItem[];
};

function mapPaymentStatusLabel(paymentStatus: PaymentStatus): string {
  if (paymentStatus === "paid") {
    return "Pago aprobado";
  }
  if (paymentStatus === "pending") {
    return "Pago pendiente";
  }
  if (paymentStatus === "failed") {
    return "Pago fallido";
  }
  return "Esperando pago";
}

function mapOrderDetail(data: { order: OrderRow; items: OrderItemRow[] }): OrderDetail {
  const paymentStatus = data.order.payment_status;
  return {
    orderId: data.order.id,
    publicReference: data.order.public_reference,
    paymentStatus,
    paymentStatusLabel: mapPaymentStatusLabel(paymentStatus),
    total: Number(data.order.total),
    items: data.items.map((item) => ({
      title: item.title_snapshot,
      quantity: item.quantity,
      customization: item.customization_snapshot ? "sí" : "no",
      fulfillment: item.fulfillment_snapshot,
      promisedDays: {
        minDays: item.promised_min_days,
        maxDays: item.promised_max_days,
      },
      unitPrice: Number(item.unit_price_snapshot),
      lineTotal: Number(item.unit_price_snapshot) * item.quantity,
    })),
  };
}

export async function getOrderDetailByPublicReference(
  publicReference: string
): Promise<OrderDetail | null> {
  const found = await getOrderWithItemsByPublicReference(publicReference);
  if (!found) {
    return null;
  }
  return mapOrderDetail(found);
}

export async function getOrderDetailByOrderId(
  orderId: string
): Promise<OrderDetail | null> {
  const found = await getOrderWithItemsById(orderId);
  if (!found) {
    return null;
  }
  return mapOrderDetail(found);
}
