import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

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
  if (!user || !password) {
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
  if (!isAuthorized(request)) {
    return unauthorizedResponse();
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
