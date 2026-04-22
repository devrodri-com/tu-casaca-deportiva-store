import { NextResponse } from "next/server";
import { updateVariantExpressStock } from "@/modules/catalog/infrastructure/catalog-store";

function parseExpressStock(value: string): number | null {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isInteger(parsed) || parsed < 0) {
    return null;
  }
  return parsed;
}

export async function POST(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";
  let variantId = "";
  let expressStockRaw = "";

  if (contentType.includes("application/json")) {
    const body = (await request.json()) as {
      variantId?: string;
      expressStock?: number;
    };
    variantId = body.variantId ?? "";
    expressStockRaw =
      body.expressStock === undefined ? "" : String(body.expressStock);
  } else {
    const formData = await request.formData();
    variantId = String(formData.get("variantId") ?? "");
    expressStockRaw = String(formData.get("expressStock") ?? "");
  }

  const expressStock = parseExpressStock(expressStockRaw);
  if (!variantId || expressStock === null) {
    return NextResponse.json(
      { ok: false, message: "variantId y expressStock válidos son requeridos." },
      { status: 400 }
    );
  }

  await updateVariantExpressStock({ variantId, expressStock });

  if (contentType.includes("application/json")) {
    return NextResponse.json({ ok: true });
  }
  return NextResponse.redirect(new URL("/admin/products", request.url), 303);
}
