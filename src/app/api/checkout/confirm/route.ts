import { NextResponse } from "next/server";
import type { CartLine } from "@/modules/cart";
import {
  parseCheckoutConfirmBody,
  readJsonValue,
} from "@/lib/http/validation";
import { getCatalogProductAndVariantByIds } from "@/modules/catalog/infrastructure/catalog-store";
import { buildOrderFromCart } from "@/modules/orders";
import { insertOrder } from "@/modules/orders/infrastructure/order-store";
import {
  assertExpressLinesWithinStock,
  resolvePurchasableLineForCheckout,
} from "@/modules/purchase";

export async function POST(request: Request) {
  const jsonIn = await readJsonValue(request);
  if (!jsonIn.ok) {
    return NextResponse.json(
      { ok: false, message: jsonIn.message },
      { status: 400 }
    );
  }
  const parsed = parseCheckoutConfirmBody(jsonIn.value);
  if (!parsed.ok) {
    return NextResponse.json(
      { ok: false, message: parsed.message },
      { status: 400 }
    );
  }
  const body = parsed.value;
  const customer = body.customer;

  const expressStockByVariantId = new Map<string, number>();
  let validatedLines: CartLine[];
  try {
    validatedLines = await Promise.all(
      body.lines.map(async (line) => {
        if (line.quantity < 1) {
          throw new Error("Cantidad inválida en carrito.");
        }

        const authoritative = await getCatalogProductAndVariantByIds(
          line.productId,
          line.variantId
        );
        if (!authoritative) {
          throw new Error("Producto o variante no encontrado.");
        }
        const variant = authoritative.variantRecord.variant;
        expressStockByVariantId.set(variant.id, variant.expressStock);

        const customizationEnabled = line.customization?.isCustomized === true;
        if (
          customizationEnabled &&
          (!authoritative.product.supportsCustomization ||
            authoritative.product.customizationSurcharge === null)
        ) {
          throw new Error("La personalización no es válida para este producto.");
        }
        const customizationSurcharge = customizationEnabled
          ? authoritative.product.customizationSurcharge
          : 0;
        if (customizationSurcharge === null) {
          throw new Error("La personalización no es válida para este producto.");
        }
        const customizationNumber = line.customization?.jerseyNumber?.trim() ?? "";
        const customizationName = line.customization?.jerseyName?.trim() ?? "";
        if (customizationEnabled) {
          if (!/^\d+$/.test(customizationNumber)) {
            throw new Error("Número de personalización inválido.");
          }
          if (customizationName.length === 0) {
            throw new Error("Nombre de personalización requerido.");
          }
        }

        const resolvedLine = resolvePurchasableLineForCheckout(
          {
            product: authoritative.product,
            variant,
            unitBasePrice: authoritative.variantRecord.unitBasePrice,
            customization: {
              isCustomized: customizationEnabled,
              surchargeAmount: customizationSurcharge,
            },
          },
          {
            requestedFulfillment: line.fulfillment,
            quantity: line.quantity,
          }
        );

        return {
          productId: authoritative.product.id,
          variantId: authoritative.variantRecord.variant.id,
          title: authoritative.product.title,
          imageUrl: line.imageUrl ?? null,
          imageAlt: line.imageAlt ?? null,
          size: authoritative.variantRecord.variant.size,
          fulfillment: resolvedLine.fulfillment,
          promisedDays: {
            minDays: resolvedLine.promisedDays.minDays,
            maxDays: resolvedLine.promisedDays.maxDays,
          },
          finalUnitPrice: resolvedLine.finalUnitPrice,
          customization: customizationEnabled
            ? {
                isCustomized: true,
                surchargeAmount: customizationSurcharge,
                jerseyNumber: customizationNumber,
                jerseyName: customizationName,
              }
            : null,
          quantity: line.quantity,
        };
      })
    );
    assertExpressLinesWithinStock(
      validatedLines.map((l) => ({
        variantId: l.variantId,
        fulfillment: l.fulfillment,
        quantity: l.quantity,
      })),
      expressStockByVariantId
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "No se pudo validar el carrito.";
    return NextResponse.json({ ok: false, message }, { status: 400 });
  }

  const orderId = crypto.randomUUID();
  const publicReference = crypto.randomUUID().replaceAll("-", "").slice(0, 16);
  const order = buildOrderFromCart({
    id: orderId,
    publicReference,
    customer: {
      fullName: customer.fullName.trim(),
      phone: customer.phone.trim(),
      email: customer.email?.trim() ? customer.email.trim() : null,
      address: customer.address.trim(),
      city: customer.city.trim(),
      department: customer.department.trim(),
      country: "Uruguay",
    },
    lines: validatedLines,
  });

  await insertOrder(order);

  return NextResponse.json({ ok: true, orderId, publicReference });
}
