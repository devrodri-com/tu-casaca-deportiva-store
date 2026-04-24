import type { CartLine, CartLineCustomization } from "@/modules/cart";

const URUGUAY_DEPARTMENTS = new Set<string>([
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

const FULFILLMENT_VALUES = new Set<CartLine["fulfillment"]>([
  "express",
  "made_to_order",
  "unavailable",
]);

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isNumberOrNull(value: unknown): value is number | null {
  return (
    value === null ||
    (typeof value === "number" && Number.isFinite(value))
  );
}

function isNonEmptyTrimmedString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

type CheckoutConfirmValid = {
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

type ValidationFail = { ok: false; message: string };
type ValidationOk<T> = { ok: true; value: T };
type Result<T> = ValidationOk<T> | ValidationFail;

function fail(message: string): ValidationFail {
  return { ok: false, message };
}

function isFiniteNumberGte0(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0;
}

function parseImageUrlField(value: unknown): Result<string | null> {
  if (value === undefined) {
    return { ok: true, value: null };
  }
  if (value === null) {
    return { ok: true, value: null };
  }
  if (typeof value === "string") {
    return { ok: true, value };
  }
  return fail("imageUrl de línea inválido.");
}

function parseImageAltField(value: unknown): Result<string | null> {
  if (value === undefined) {
    return { ok: true, value: null };
  }
  if (value === null) {
    return { ok: true, value: null };
  }
  if (typeof value === "string") {
    return { ok: true, value };
  }
  return fail("imageAlt de línea inválido.");
}

function parseLineCustomization(
  raw: unknown
): Result<CartLineCustomization> {
  if (raw === undefined || raw === null) {
    return { ok: true, value: null };
  }
  if (!isPlainObject(raw)) {
    return fail("customization inválido en una línea.");
  }
  if (typeof raw.isCustomized !== "boolean") {
    return fail("isCustomized debe ser booleano en personalización.");
  }
  if (!isFiniteNumberGte0(raw.surchargeAmount)) {
    return fail("surchargeAmount inválido en personalización.");
  }
  if (raw.isCustomized) {
    if (typeof raw.jerseyNumber !== "string" || !/^\d+$/.test(raw.jerseyNumber)) {
      return fail("Número de personalización inválido.");
    }
    if (typeof raw.jerseyName !== "string" || raw.jerseyName.trim().length === 0) {
      return fail("Nombre de personalización requerido.");
    }
    return {
      ok: true,
      value: {
        isCustomized: true,
        surchargeAmount: raw.surchargeAmount,
        jerseyNumber: raw.jerseyNumber,
        jerseyName: raw.jerseyName,
      },
    };
  }
  return {
    ok: true,
    value: {
      isCustomized: false,
      surchargeAmount: raw.surchargeAmount,
      jerseyNumber: typeof raw.jerseyNumber === "string" ? raw.jerseyNumber : "",
      jerseyName: typeof raw.jerseyName === "string" ? raw.jerseyName : "",
    },
  };
}

/**
 * Línea con imagen: si el cliente manda `imageUrl` o `imageAlt` deben ser string | null
 * o indefinido (misma semántica que el carrito persistido).
 */
function parseOneCartLine(
  lineRaw: unknown,
  index: number
): Result<CartLine> {
  if (!isPlainObject(lineRaw)) {
    return fail(`Línea ${index + 1}: se esperaba un objeto.`);
  }
  if (!isNonEmptyTrimmedString(lineRaw.productId)) {
    return fail(`Línea ${index + 1}: productId inválido.`);
  }
  if (!isNonEmptyTrimmedString(lineRaw.variantId)) {
    return fail(`Línea ${index + 1}: variantId inválido.`);
  }
  if (!isNonEmptyTrimmedString(lineRaw.title)) {
    return fail(`Línea ${index + 1}: title inválido.`);
  }
  if (!isNonEmptyTrimmedString(lineRaw.size)) {
    return fail(`Línea ${index + 1}: size inválido.`);
  }
  if (typeof lineRaw.fulfillment !== "string") {
    return fail(`Línea ${index + 1}: fulfillment inválido.`);
  }
  if (!FULFILLMENT_VALUES.has(lineRaw.fulfillment as CartLine["fulfillment"])) {
    return fail(`Línea ${index + 1}: fulfillment inválido.`);
  }
  const fulfillment: CartLine["fulfillment"] =
    lineRaw.fulfillment as CartLine["fulfillment"];
  if (!isPlainObject(lineRaw.promisedDays)) {
    return fail(`Línea ${index + 1}: promisedDays inválido.`);
  }
  if (!isNumberOrNull(lineRaw.promisedDays.minDays)) {
    return fail(`Línea ${index + 1}: promisedDays.minDays inválido.`);
  }
  if (!isNumberOrNull(lineRaw.promisedDays.maxDays)) {
    return fail(`Línea ${index + 1}: promisedDays.maxDays inválido.`);
  }
  if (!isFiniteNumberGte0(lineRaw.finalUnitPrice)) {
    return fail(`Línea ${index + 1}: finalUnitPrice inválido.`);
  }
  const qty = lineRaw.quantity;
  if (
    typeof qty !== "number" ||
    !Number.isInteger(qty) ||
    qty < 1 ||
    qty > 20
  ) {
    return fail(`Línea ${index + 1}: cantidad inválida.`);
  }
  const cust = parseLineCustomization(lineRaw.customization);
  if (!cust.ok) {
    return cust;
  }
  const img = parseImageUrlField(lineRaw.imageUrl);
  if (!img.ok) {
    return img;
  }
  const alt = parseImageAltField(lineRaw.imageAlt);
  if (!alt.ok) {
    return alt;
  }
  let productSlug: string | null | undefined;
  if (lineRaw.productSlug === undefined) {
    productSlug = undefined;
  } else if (lineRaw.productSlug === null) {
    productSlug = null;
  } else if (typeof lineRaw.productSlug === "string") {
    productSlug = lineRaw.productSlug;
  } else {
    return fail(`Línea ${index + 1}: productSlug inválido.`);
  }
  return {
    ok: true,
    value: {
      productId: lineRaw.productId.trim(),
      productSlug,
      variantId: lineRaw.variantId.trim(),
      title: lineRaw.title.trim(),
      imageUrl: img.value,
      imageAlt: alt.value,
      size: lineRaw.size.trim(),
      fulfillment,
      promisedDays: {
        minDays: lineRaw.promisedDays.minDays,
        maxDays: lineRaw.promisedDays.maxDays,
      },
      finalUnitPrice: lineRaw.finalUnitPrice,
      customization: cust.value,
      quantity: qty,
    },
  };
}

function parseEmailField(value: unknown): Result<string | null> {
  if (value === undefined || value === null) {
    return { ok: true, value: null };
  }
  if (typeof value === "string") {
    return { ok: true, value };
  }
  return fail("email inválido.");
}

function parseCustomer(
  raw: unknown
): Result<CheckoutConfirmValid["customer"]> {
  if (!isPlainObject(raw)) {
    return fail("customer inválido.");
  }
  if (!isNonEmptyTrimmedString(raw.fullName)) {
    return fail("fullName es requerido.");
  }
  if (!isNonEmptyTrimmedString(raw.phone)) {
    return fail("Teléfono es requerido.");
  }
  if (!isNonEmptyTrimmedString(raw.address)) {
    return fail("Dirección es requerida.");
  }
  if (!isNonEmptyTrimmedString(raw.city)) {
    return fail("Barrio o ciudad es requerido.");
  }
  if (typeof raw.department !== "string") {
    return fail("Seleccioná un departamento válido de Uruguay.");
  }
  if (!URUGUAY_DEPARTMENTS.has(raw.department.trim())) {
    return fail("Seleccioná un departamento válido de Uruguay.");
  }
  if (typeof raw.country !== "string" || raw.country.trim() !== "Uruguay") {
    return fail("País inválido para este checkout.");
  }
  const emailR = parseEmailField(raw.email);
  if (!emailR.ok) {
    return emailR;
  }
  return {
    ok: true,
    value: {
      fullName: raw.fullName.trim(),
      phone: raw.phone.trim(),
      email: emailR.value,
      address: raw.address.trim(),
      city: raw.city.trim(),
      department: raw.department.trim(),
      country: "Uruguay",
    },
  };
}

export function parseCheckoutConfirmBody(
  raw: unknown
): Result<CheckoutConfirmValid> {
  if (!isPlainObject(raw)) {
    return fail("El cuerpo debe ser un objeto JSON.");
  }
  if (!Array.isArray(raw.lines) || raw.lines.length === 0) {
    return fail("El carrito no puede estar vacío.");
  }
  const lines: CartLine[] = [];
  for (let i = 0; i < raw.lines.length; i++) {
    const line = parseOneCartLine(raw.lines[i], i);
    if (!line.ok) {
      return line;
    }
    lines.push(line.value);
  }
  const customer = parseCustomer(raw.customer);
  if (!customer.ok) {
    return customer;
  }
  return { ok: true, value: { lines, customer: customer.value } };
}

export type MercadoPagoPreferenceBody = {
  orderId: string;
};

export function parseMercadoPagoPreferenceBody(
  raw: unknown
): Result<MercadoPagoPreferenceBody> {
  if (!isPlainObject(raw)) {
    return fail("El cuerpo debe ser un objeto JSON.");
  }
  if (typeof raw.orderId !== "string" || raw.orderId.trim() === "") {
    return fail("orderId es requerido.");
  }
  return { ok: true, value: { orderId: raw.orderId.trim() } };
}

export type MercadoPagoWebhookParsed = {
  type: string;
  action: string;
};

/**
 * Válida JSON ya parseado: objeto, type/action solo si son string.
 * No se interpreta `data` ni el resto del payload (Mercado Pago).
 */
export function parseMercadoPagoWebhookBody(
  raw: unknown
): Result<MercadoPagoWebhookParsed> {
  if (!isPlainObject(raw)) {
    return fail("El cuerpo debe ser un objeto JSON.");
  }
  if (raw.type !== undefined && raw.type !== null && typeof raw.type !== "string") {
    return fail("type inválido en webhook.");
  }
  if (
    raw.action !== undefined &&
    raw.action !== null &&
    typeof raw.action !== "string"
  ) {
    return fail("action inválido en webhook.");
  }
  return {
    ok: true,
    value: {
      type: typeof raw.type === "string" ? raw.type : "",
      action: typeof raw.action === "string" ? raw.action : "",
    },
  };
}

/**
 * `request.json()` con error controlado (400) para cuerpos malformados.
 */
export async function readJsonValue(
  request: Request
): Promise<Result<unknown>> {
  try {
    const value: unknown = await request.json();
    return { ok: true, value };
  } catch {
    return fail("Cuerpo JSON inválido.");
  }
}
