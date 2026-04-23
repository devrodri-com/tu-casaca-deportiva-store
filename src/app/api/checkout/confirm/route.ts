import { NextResponse } from "next/server";
import type { CartLine } from "@/modules/cart";
import { getCatalogProductAndVariantByIds } from "@/modules/catalog/infrastructure/catalog-store";
import { buildOrderFromCart } from "@/modules/orders";
import { insertOrder } from "@/modules/orders/infrastructure/order-store";
import { resolvePurchasableLine } from "@/modules/purchase";

type CheckoutConfirmBody = {
  lines: CartLine[];
  customer: {
    fullName: string;
    phone: string;
    email: string | null;
    address: string;
    city: string;
    department: string;
    country: "Uruguay";
  };
};

const URUGUAY_DEPARTMENTS = new Set([
  "Montevideo",
  "Canelones",
  "Maldonado",
  "Colonia",
  "San José",
  "Florida",
  "Lavalleja",
  "Rocha",
  "Treinta y Tres",
  "Cerro Largo",
  "Durazno",
  "Flores",
  "Soriano",
  "Río Negro",
  "Paysandú",
  "Salto",
  "Artigas",
  "Rivera",
  "Tacuarembó",
]);

export async function POST(request: Request) {
  const body = (await request.json()) as CheckoutConfirmBody;
  const customer = body.customer;

  if (!Array.isArray(body.lines) || body.lines.length === 0) {
    return NextResponse.json(
      { ok: false, message: "El carrito no puede estar vacío." },
      { status: 400 }
    );
  }

  if (!customer || customer.fullName.trim().length === 0) {
    return NextResponse.json(
      { ok: false, message: "fullName es requerido." },
      { status: 400 }
    );
  }

  if (!customer || customer.phone.trim().length === 0) {
    return NextResponse.json(
      { ok: false, message: "Teléfono es requerido." },
      { status: 400 }
    );
  }

  if (!customer || customer.address.trim().length === 0) {
    return NextResponse.json(
      { ok: false, message: "Dirección es requerida." },
      { status: 400 }
    );
  }

  if (!customer || customer.city.trim().length === 0) {
    return NextResponse.json(
      { ok: false, message: "Barrio o ciudad es requerido." },
      { status: 400 }
    );
  }

  if (!customer || !URUGUAY_DEPARTMENTS.has(customer.department.trim())) {
    return NextResponse.json(
      { ok: false, message: "Seleccioná un departamento válido de Uruguay." },
      { status: 400 }
    );
  }

  if (!customer || customer.country.trim() !== "Uruguay") {
    return NextResponse.json(
      { ok: false, message: "País inválido para este checkout." },
      { status: 400 }
    );
  }

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

        const resolvedLine = resolvePurchasableLine({
          product: authoritative.product,
          variant: authoritative.variantRecord.variant,
          unitBasePrice: authoritative.variantRecord.unitBasePrice,
          customization: {
            isCustomized: customizationEnabled,
            surchargeAmount: customizationSurcharge,
          },
        });

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
