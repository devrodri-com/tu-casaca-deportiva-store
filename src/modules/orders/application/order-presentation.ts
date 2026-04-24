import type { Json } from "@/lib/supabase/database.types";

type Fulfillment = "express" | "made_to_order" | "unavailable";

export function formatOrderMoneyUruguay(amount: number): string {
  return `$${Math.round(amount).toLocaleString("es-UY")}`;
}

export function fulfillmentAndDeliveryText(params: {
  fulfillment: Fulfillment;
  minDays: number | null;
  maxDays: number | null;
}): { shortLabel: string; deliveryLine: string } {
  if (params.fulfillment === "express") {
    return {
      shortLabel: "Express",
      deliveryLine:
        "Listo 24-48 h: retiro o envío según lo coordinemos por WhatsApp.",
    };
  }
  if (params.fulfillment === "made_to_order") {
    const { minDays, maxDays } = params;
    let deliveryLine: string;
    if (
      minDays != null &&
      maxDays != null &&
      minDays > 0 &&
      maxDays >= minDays
    ) {
      deliveryLine = `Entrega estimada: ${minDays} a ${maxDays} días hábiles.`;
    } else {
      deliveryLine = "Entrega según plazo acordado en encargo (típico 14-21 días).";
    }
    return { shortLabel: "Por encargo", deliveryLine };
  }
  return {
    shortLabel: "Por confirmar",
    deliveryLine: "Plazo de entrega a confirmar según stock y personalización.",
  };
}

/**
 * Convierte el JSON guardado en order_items en un texto de línea, sin exigir campos
 * no presentes en pedidos anteriores.
 */
export function customizationDisplayLine(snapshot: Json | null): string | null {
  if (snapshot === null || typeof snapshot !== "object" || Array.isArray(snapshot)) {
    return null;
  }
  const o = snapshot as Record<string, unknown>;
  if (o.isCustomized === true) {
    const n = o.jerseyNumber;
    const name = o.jerseyName;
    if (typeof n === "string" && typeof name === "string" && n.length > 0 && name.length > 0) {
      return `Personalización: #${n} · ${name}`;
    }
    return "Incluye personalización (dorsal y nombre).";
  }
  return null;
}

type Payment = "awaiting_payment" | "pending" | "paid" | "failed";

export function orderStatusForCustomer(phase: Payment): {
  headline: string;
  subtext: string;
  followUp: string | null;
} {
  if (phase === "paid") {
    return {
      headline: "Pago confirmado",
      subtext:
        "Registramos tu pago. Te vamos a contactar si hace falta un dato o para coordinar entrega/retiro.",
      followUp:
        "Seguís tu pedido con la referencia de abajo. El estado de preparación y envío lo actualizamos de nuestro lado.",
    };
  }
  if (phase === "pending") {
    return {
      headline: "Pago pendiente",
      subtext:
        "Todavía no tenemos el acreditado final. A veces demora unos minutos: podés recargar esta página o volver en un rato.",
      followUp: null,
    };
  }
  if (phase === "failed") {
    return {
      headline: "Pago no aprobado",
      subtext:
        "No pudimos aprobar el pago. Podés volver al carrito, revisar el medio de pago o probá otra tarjeta.",
      followUp: null,
    };
  }
  return {
    headline: "Pago en proceso de confirmación",
    subtext:
      "Aún no tenemos un resultado final del pago. Refrescá en unos minutos o consultanos por la referencia pública de tu pedido.",
    followUp: null,
  };
}

export function operationalHint(
  operational:
    | "paid"
    | "preparing"
    | "ready"
    | "shipped"
    | "delivered"
    | "cancelled"
    | null
    | undefined
): string | null {
  if (operational === "preparing") {
    return "Tu pedido está en preparación.";
  }
  if (operational === "ready" || operational === "shipped") {
    return "Pronto coordinamos o enviamos. Si tenés dudas, escribinos por Instagram o WhatsApp.";
  }
  if (operational === "delivered") {
    return "Pedido entregado. Gracias por confiar en nosotros.";
  }
  if (operational === "cancelled") {
    return "Este pedido fue anulado. Escribinos si no tenés contexto o necesitás ayuda.";
  }
  if (operational === "paid") {
    return "Estamos a punto de ponerlo en movimiento. Te avisamos por cualquier novedad.";
  }
  return null;
}
