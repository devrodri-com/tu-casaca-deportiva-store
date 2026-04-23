import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Rutas `/admin` y `/api/admin/*` están protegidas por HTTP Basic Auth en el edge.
 * NO usa usuarios de Supabase ni cuentas de la app: solo credenciales del servidor
 * vía variables de entorno (Vercel, docker, etc.).
 *
 * Requeridas ambas:
 * - ADMIN_BASIC_USER
 * - ADMIN_BASIC_PASSWORD
 */
function adminBasicCredentialsConfigured(): boolean {
  const user = process.env.ADMIN_BASIC_USER?.trim();
  const password = process.env.ADMIN_BASIC_PASSWORD;
  return Boolean(user && password);
}

function misconfigurationResponse(): NextResponse {
  return new NextResponse(
    [
      "Acceso a admin no disponible: faltan ADMIN_BASIC_USER y/o ADMIN_BASIC_PASSWORD en el entorno.",
      "Configurá ambas variables en Vercel / .env del servidor. No son usuarios de la app: es Basic Auth a nivel de middleware.",
    ].join("\n"),
    {
      status: 503,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    }
  );
}

function unauthorizedResponse(): NextResponse {
  return new NextResponse("Unauthorized", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="Admin Area"',
    },
  });
}

function isAuthorized(request: NextRequest): boolean {
  const user = process.env.ADMIN_BASIC_USER;
  const password = process.env.ADMIN_BASIC_PASSWORD;
  if (!user?.trim() || !password) {
    return false;
  }

  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Basic ")) {
    return false;
  }

  const encoded = authHeader.slice("Basic ".length);
  const decoded = atob(encoded);
  return decoded === `${user}:${password}`;
}

export function middleware(request: NextRequest) {
  if (!adminBasicCredentialsConfigured()) {
    return misconfigurationResponse();
  }
  if (!isAuthorized(request)) {
    return unauthorizedResponse();
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
