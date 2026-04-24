import {
  isValidMadeToOrderRange,
  resolveAvailability,
  type Product,
  type ProductVariant,
} from "@/modules/catalog";
import type { PurchaseCustomization } from "./customization";

const EXPRESS_PROMISED_MIN_DAYS = 0;
const EXPRESS_PROMISED_MAX_DAYS = 2;

export type PurchaseFulfillment = "express" | "made_to_order" | "unavailable";

export type PromisedDaysRange = {
  minDays: number | null;
  maxDays: number | null;
};

export type PurchasableLineInput = {
  product: Product;
  variant: ProductVariant;
  unitBasePrice: number;
  customization: PurchaseCustomization;
};

export type PurchasableLine = {
  productId: string;
  variantId: string;
  finalUnitPrice: number;
  fulfillment: PurchaseFulfillment;
  promisedDays: PromisedDaysRange;
};

/**
 * Intención de fulfillment por línea (carrito / checkout). El catálogo valida, no reemplaza
 * heurísticamente por stock salvo en la vía "sin intención" de {@link resolvePurchasableLine}.
 */
export type CartLineFulfillmentIntent = {
  requestedFulfillment: PurchaseFulfillment;
  quantity: number;
};

/**
 * Resuelve precio, plazos y fulfillment respetando la intención de la línea (p. ej. reparto
 * express + encargo de la PDP). Sigue al catálogo: precios desde `unitBasePrice` + recargo;
 * MTO/ express validados contra la variante.
 * La personalización sigue forzando encargo. No sustituye la validación de agregado de
 * unidades express por variante (hacer en el checkout vía
 * {@link assertExpressLinesWithinStock}).
 */
export function resolvePurchasableLineForCheckout(
  input: PurchasableLineInput,
  intent: CartLineFulfillmentIntent
): PurchasableLine {
  if (input.variant.productId !== input.product.id) {
    throw new Error("variant.productId must match product.id");
  }
  if (input.unitBasePrice < 0) {
    throw new Error("unitBasePrice must be >= 0");
  }
  if (input.customization.surchargeAmount < 0) {
    throw new Error("customization.surchargeAmount must be >= 0");
  }
  if (intent.quantity < 1) {
    throw new Error("quantity must be >= 1");
  }

  const finalUnitPrice =
    input.unitBasePrice + input.customization.surchargeAmount;
  const baseAvailability = resolveAvailability(input.variant);

  if (baseAvailability === "unavailable") {
    throw new Error("Producto no disponible en este momento.");
  }

  if (input.customization.isCustomized) {
    if (!isValidMadeToOrderRange(input.variant)) {
      throw new Error(
        "La personalización requiere plazos de encargo configurados en la variante."
      );
    }
    if (!input.variant.allowMadeToOrder) {
      throw new Error("La personalización requiere encargo habilitado en esta variante.");
    }
    if (
      input.variant.madeToOrderMinDays === null ||
      input.variant.madeToOrderMaxDays === null
    ) {
      throw new Error(
        "La personalización requiere plazos mín/máx de encargo en la variante."
      );
    }
    return {
      productId: input.product.id,
      variantId: input.variant.id,
      finalUnitPrice,
      fulfillment: "made_to_order",
      promisedDays: {
        minDays: input.variant.madeToOrderMinDays,
        maxDays: input.variant.madeToOrderMaxDays,
      },
    };
  }

  switch (intent.requestedFulfillment) {
    case "unavailable":
      throw new Error("La línea no está disponible para la compra.");
    case "made_to_order": {
      if (!input.variant.allowMadeToOrder) {
        throw new Error("El encargo no está habilitado para esta variante.");
      }
      if (!isValidMadeToOrderRange(input.variant)) {
        throw new Error("Plazos de encargo no válidos para esta variante.");
      }
      if (
        input.variant.madeToOrderMinDays === null ||
        input.variant.madeToOrderMaxDays === null
      ) {
        throw new Error("Faltan plazos mín. y máx. de encargo en la variante.");
      }
      return {
        productId: input.product.id,
        variantId: input.variant.id,
        finalUnitPrice,
        fulfillment: "made_to_order",
        promisedDays: {
          minDays: input.variant.madeToOrderMinDays,
          maxDays: input.variant.madeToOrderMaxDays,
        },
      };
    }
    case "express": {
      if (input.variant.expressStock < 1) {
        throw new Error("No hay unidades disponibles con entrega express para esta variante.");
      }
      return {
        productId: input.product.id,
        variantId: input.variant.id,
        finalUnitPrice,
        fulfillment: "express",
        promisedDays: {
          minDays: EXPRESS_PROMISED_MIN_DAYS,
          maxDays: EXPRESS_PROMISED_MAX_DAYS,
        },
      };
    }
  }
}

/**
 * Suma de cantidades express por variante no puede superar el `expressStock` del catálogo
 * (varias líneas con la misma variante, p. ej. reparto express + encargo).
 */
export function assertExpressLinesWithinStock(
  lines: ReadonlyArray<{
    variantId: string;
    fulfillment: PurchaseFulfillment;
    quantity: number;
  }>,
  expressStockByVariantId: ReadonlyMap<string, number>
): void {
  const demand = new Map<string, number>();
  for (const line of lines) {
    if (line.fulfillment !== "express") {
      continue;
    }
    const { variantId, quantity } = line;
    demand.set(variantId, (demand.get(variantId) ?? 0) + quantity);
  }
  for (const [variantId, units] of demand) {
    const stock = expressStockByVariantId.get(variantId);
    if (stock === undefined) {
      throw new Error("Inconsistencia: variante de línea express sin stock en catálogo.");
    }
    if (units > stock) {
      throw new Error(
        "Stock express insuficiente para el total de unidades solicitadas (revisá cantidades o carrito desactualizado)."
      );
    }
  }
}

export function resolvePurchasableLine(
  input: PurchasableLineInput
): PurchasableLine {
  if (input.variant.productId !== input.product.id) {
    throw new Error("variant.productId must match product.id");
  }
  if (input.unitBasePrice < 0) {
    throw new Error("unitBasePrice must be >= 0");
  }
  if (input.customization.surchargeAmount < 0) {
    throw new Error("customization.surchargeAmount must be >= 0");
  }

  const finalUnitPrice =
    input.unitBasePrice + input.customization.surchargeAmount;
  const baseAvailability = resolveAvailability(input.variant);

  if (baseAvailability === "unavailable") {
    return {
      productId: input.product.id,
      variantId: input.variant.id,
      finalUnitPrice,
      fulfillment: "unavailable",
      promisedDays: { minDays: null, maxDays: null },
    };
  }

  if (input.customization.isCustomized) {
    if (!isValidMadeToOrderRange(input.variant)) {
      throw new Error(
        "Customized line requires a valid made-to-order promised days range"
      );
    }

    return {
      productId: input.product.id,
      variantId: input.variant.id,
      finalUnitPrice,
      fulfillment: "made_to_order",
      promisedDays: {
        minDays: input.variant.madeToOrderMinDays,
        maxDays: input.variant.madeToOrderMaxDays,
      },
    };
  }

  if (baseAvailability === "express") {
    return {
      productId: input.product.id,
      variantId: input.variant.id,
      finalUnitPrice,
      fulfillment: "express",
      promisedDays: {
        minDays: EXPRESS_PROMISED_MIN_DAYS,
        maxDays: EXPRESS_PROMISED_MAX_DAYS,
      },
    };
  }

  if (!isValidMadeToOrderRange(input.variant)) {
    throw new Error("made_to_order line requires a valid promised days range");
  }

  return {
    productId: input.product.id,
    variantId: input.variant.id,
    finalUnitPrice,
    fulfillment: "made_to_order",
    promisedDays: {
      minDays: input.variant.madeToOrderMinDays,
      maxDays: input.variant.madeToOrderMaxDays,
    },
  };
}
