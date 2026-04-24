import {
  getOrderWithItemsById,
  getOrderWithItemsByPublicReference,
} from "@/modules/orders/infrastructure/order-store";
import type { Database, Json } from "@/lib/supabase/database.types";
import {
  customizationDisplayLine,
  fulfillmentAndDeliveryText,
  orderStatusForCustomer,
  operationalHint,
} from "./order-presentation";

type PaymentStatus = "awaiting_payment" | "pending" | "paid" | "failed";
type OrderRow = Database["public"]["Tables"]["orders"]["Row"];
type OrderItemRow = Database["public"]["Tables"]["order_items"]["Row"];

export type OrderDetailItem = {
  productTitle: string;
  sizeLabel: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  /** "Express" / "Por encargo" / "Por confirmar" */
  fulfillmentKind: string;
  /** Línea completa con plazos o 24-48h */
  deliveryLine: string;
  customizationLine: string | null;
};

export type OrderDetail = {
  publicReference: string;
  total: number;
  /** Solo para lógica de plantillas (nunca mostrar en UI) */
  paymentStatus: PaymentStatus;
  statusHeadline: string;
  statusSubtext: string;
  followUpLine: string | null;
  operationalMessage: string | null;
  items: OrderDetailItem[];
};

function mapOrderDetail(data: { order: OrderRow; items: OrderItemRow[] }): OrderDetail {
  const paymentStatus = data.order.payment_status;
  const { headline, subtext, followUp } = orderStatusForCustomer(paymentStatus);
  return {
    publicReference: data.order.public_reference,
    total: Number(data.order.total),
    paymentStatus,
    statusHeadline: headline,
    statusSubtext: subtext,
    followUpLine: followUp,
    operationalMessage: operationalHint(data.order.operational_status),
    items: data.items.map((item) => {
      const { shortLabel, deliveryLine } = fulfillmentAndDeliveryText({
        fulfillment: item.fulfillment_snapshot,
        minDays: item.promised_min_days,
        maxDays: item.promised_max_days,
      });
      return {
        productTitle: item.title_snapshot,
        sizeLabel: item.size_snapshot,
        quantity: item.quantity,
        unitPrice: Number(item.unit_price_snapshot),
        lineTotal: Number(item.unit_price_snapshot) * item.quantity,
        fulfillmentKind: shortLabel,
        deliveryLine,
        customizationLine: customizationDisplayLine(
          (item.customization_snapshot ?? null) as Json
        ),
      };
    }),
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
